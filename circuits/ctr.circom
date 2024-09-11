pragma circom 2.1.9;

include "cipher.circom";
include "transformations.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";

template EncryptCTR(l,nk){
        signal input plainText[l];
        signal input iv[16];
        signal input key[nk * 4];
        signal output cipher[l];

        component checkPlainText[l];
        for (var i = 0; i < l; i++) {
                checkPlainText[i] = Num2Bits(8);
                checkPlainText[i].in <== plainText[i];
        }

        component checkIv[16];
        for (var i = 0; i < 16; i++) {
                checkIv[i] = Num2Bits(8);
                checkIv[i].in <== iv[i];
        }

        component checkKey[nk * 4];
        for (var i = 0; i < nk * 4; i++) {
                checkKey[i] = Num2Bits(8);
                checkKey[i].in <== key[i];
        }

        var n = l\16;
        if(l%16 > 0){
                n = n + 1;
        }

        component toBlocks = ToBlocks(l);
        toBlocks.stream <== plainText;

        component aes[n];

        signal cipherBlocks[n][4][4];
        component AddCipher[n];

        component generateCtrBlocks = GenerateCounterBlocks(n);
        generateCtrBlocks.iv <== iv;

        for(var i = 0 ; i < n; i++){
                aes[i] = Cipher(nk);
                aes[i].key <== key;
                aes[i].block <== generateCtrBlocks.counterBlocks[i];

                AddCipher[i] = AddCipher();
                AddCipher[i].state <== toBlocks.blocks[i];
                AddCipher[i].cipher <== aes[i].cipher;

                cipherBlocks[i] <== AddCipher[i].newState;
        }

        component toStream = ToStream(n,l);
        toStream.blocks <== cipherBlocks;

        cipher <== toStream.stream;
}


//convert stream of plain text to blocks of 16 bytes
template ToBlocks(l){
        signal input stream[l];

        var n = l\16;
        if(l%16 > 0){
                n = n + 1;
        }
        signal output blocks[n][4][4];

        var i, j, k;

        for (var idx = 0; idx < l; idx++) {
                blocks[i][k][j] <== stream[idx];
                k = k + 1;
                if (k == 4){
                        k = 0;
                        j = j + 1;
                        if (j == 4){
                                j = 0;
                                i = i + 1;
                        }
                }
        }

        if (l%16 > 0){
               blocks[i][k][j] <== 1;
               k = k + 1;
        }
}

// convert blocks of 16 bytes to stream of bytes
template ToStream(n,l){
        signal input blocks[n][4][4];

        signal output stream[l];

        var i, j, k;

        while(i*16 + j*4 + k < l){
                stream[i*16 + j*4 + k] <== blocks[i][k][j];
                k = k + 1;
                if (k == 4){
                        k = 0;
                        j = j + 1;
                        if (j == 4){
                                j = 0;
                                i = i + 1;
                        }
                }
        }
}

template AddCipher(){
    signal input state[4][4];
    signal input cipher[4][4];
    signal output newState[4][4];

    component xorbyte[4][4];

    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            xorbyte[i][j] = XorByte();
            xorbyte[i][j].a <== state[i][j];
            xorbyte[i][j].b <== cipher[i][j];
            newState[i][j] <== xorbyte[i][j].out;
        }
    }
}

template ByteInc() {
        signal input in;
        signal input control;
        signal output out;
        signal output carry;

        signal added;
        added <== in + control;

        signal addedDiff;
        addedDiff <== added - 256;
        carry <== IsZero()(addedDiff);

        out <== added - carry * 256;
}

// converts iv to counter blocks
// iv is 16 bytes
template GenerateCounterBlocks(n){
        assert(n < 0xffffffff);
        signal input iv[16];
        signal blockNonce[n][16];
        signal output counterBlocks[n][4][4];
        component toBlocks[n];
        
        component ivByteInc[n-1][16];


        toBlocks[0] = ToBlocks(16);
        toBlocks[0].stream <== iv;
        counterBlocks[0] <== toBlocks[0].blocks[0];

        for (var i = 1; i < n; i++) {
                for (var j = 15; j >= 0; j--) {
                        ivByteInc[i-1][j] = ByteInc();
                        ivByteInc[i-1][j].in <== toBlocks[i-1].stream[j];
                        if (j==15) {
                                ivByteInc[i-1][j].control <== 1;
                        } else {
                                ivByteInc[i-1][j].control <== ivByteInc[i-1][j+1].carry;
                        }
                        blockNonce[i][j] <== ivByteInc[i-1][j].out;
                }        

                toBlocks[i] = ToBlocks(16);
                toBlocks[i].stream <== blockNonce[i];
                counterBlocks[i] <== toBlocks[i].blocks[0];
        }
}