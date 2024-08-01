pragma circom 2.1.8;

include "cipher.circom";
include "transformations.circom";

template EncryptCTR(l,nk){
        signal input plainText[l];
        signal input iv[16];
        signal input key[nk * 4];
        signal output cipher[l];

        var n = l\16;
        if(l%16 > 0){
                n = n + 1;
        }

        component toBlocks[2];
        toBlocks[0] = ToBlocks(l);
        toBlocks[0].stream <== plainText;

        component aes[n];
        toBlocks[1] = ToBlocks(16);
        toBlocks[1].stream <== iv;
        var ivBlock[4][4] = toBlocks[1].blocks[0];

        signal cipherBlocks[n][4][4];
        component AddCipher[n];

        for(var i=0;i<n;i++){
                aes[i] = Cipher(nk);
                ivBlock[3][3] = (ivBlock[3][3] + i)%256;
                aes[i].key <== key;
                aes[i].block <-- ivBlock;

                AddCipher[i] = AddCipher();
                AddCipher[i].state <== toBlocks[0].blocks[i];
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