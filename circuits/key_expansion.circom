pragma circom 2.0.0;

include "sbox128.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/gates.circom";

//nk is the number of keys which can be 4, 6, 8 
template KeyExpansion(nk,nr) {
    assert(nk == 4 || nk == 6 || nk == 8 );    
    signal input key[nk * 4];
    
    var totalWords = (4 * (nr + 1));
    var effectiveRounds = nk == 4 ? 10 : totalWords\nk;

    signal output keyExpanded[totalWords][4];

    for (var i = 0; i < nk; i++) {
        for (var j = 0; j < 4; j++) {
            keyExpanded[i][j] <== key[(4 * i) + j];
        }
    }
    
    component nextRound[effectiveRounds];
    
    for (var round = 1; round <= effectiveRounds; round++) {
        var outputWordLen = round == effectiveRounds ? 4 : nk; 
        nextRound[round - 1] = NextRound(nk, outputWordLen);

        for (var i = 0; i < nk; i++) {
            for (var j = 0; j < 4; j++) {
                nextRound[round - 1].key[i][j] <== keyExpanded[(round * nk) + i - nk][j];
            }
        }

        nextRound[round - 1].round <== round;

        for (var i = 0; i < outputWordLen; i++) {
            for (var j = 0; j < 4; j++) {
                keyExpanded[(round * nk) + i][j] <== nextRound[round - 1].nextKey[i][j];
            }
        }
    }
}

//nk, output
template NextRound(nk, o){
    signal input key[nk][4]; 
    signal input round;
    signal output nextKey[o][4];

    component rotateWord = Rotate(1, 4);
    for (var i = 0; i < 4; i++) {
        rotateWord.bytes[i] <== key[nk - 1][i];
    }
    
    component substituteWord[2];
    substituteWord[0] = SubstituteWord();
    substituteWord[0].bytes <== rotateWord.rotated;

    component rcon = RCon();
    rcon.round <== round; 

    component xorWord[o + 1];
    xorWord[0] = XorWord();
    xorWord[0].bytes1 <== substituteWord[0].substituted;
    xorWord[0].bytes2 <== rcon.out;

    for (var i = 0; i < o; i++) {
        xorWord[i+1] = XorWord();
        if (i == 0) {
            xorWord[i+1].bytes1 <== xorWord[0].out;
        } else if(nk == 8 && i == 4) {
            substituteWord[1] = SubstituteWord();
            substituteWord[1].bytes <== nextKey[i - 1];
            xorWord[i+1].bytes1 <== substituteWord[1].substituted;
        } else {
            xorWord[i+1].bytes1 <== nextKey[i-1];
        }
        xorWord[i+1].bytes2 <== key[i];
        
        for (var j = 0; j < 4; j++) {
            nextKey[i][j] <== xorWord[i+1].out[j];
        }
    }
}


template BytesToWords(n) {
    assert(n % 4 == 0);
    signal input bytes[n];
    signal output words[n \ 4][n];

    for (var i = 0; i < n \ 4; i++) {
        for(var j = 0; j < 4; j++) {
            words[i][j] <== bytes[i * 4 + j];
        }
    }
}

template Rotate(rotation, length) {
    assert(rotation < length);
    signal input bytes[length];
    signal output rotated[length];

    for(var i = 0; i < length - rotation; i++) {
        rotated[i] <== bytes[i + rotation];
    }

    for(var i = length - rotation; i < length; i++) {
        rotated[i] <== bytes[i - length + rotation];
    }
}

template SubstituteWord() {
    signal input bytes[4];
    signal output substituted[4];

    component sbox[4];

    for(var i = 0; i < 4; i++) {
        sbox[i] = Sbox128();
        sbox[i].in <== bytes[i];
        substituted[i] <== sbox[i].out;
    }
}

template RCon() {
    signal input round;
    signal output out[4];

    assert(round > 0 && round <= 10);

    var rcon[10][4] = [
        [0x01, 0x00, 0x00, 0x00],
        [0x02, 0x00, 0x00, 0x00],
        [0x04, 0x00, 0x00, 0x00],
        [0x08, 0x00, 0x00, 0x00],
        [0x10, 0x00, 0x00, 0x00],
        [0x20, 0x00, 0x00, 0x00],
        [0x40, 0x00, 0x00, 0x00],
        [0x80, 0x00, 0x00, 0x00],
        [0x1b, 0x00, 0x00, 0x00],
        [0x36, 0x00, 0x00, 0x00]
    ];

    out <-- rcon[round-1];
}

template XorWord() {
    signal input bytes1[4];
    signal input bytes2[4];
    
    component n2b[4 * 2];
    component b2n[4];
    component xor[4][8];

    signal output out[4];

    for(var i = 0; i < 4; i++) {
        n2b[2 * i] = Num2Bits(8);
        n2b[2 * i + 1] = Num2Bits(8);
        n2b[2 * i].in <== bytes1[i];
        n2b[2 * i + 1].in <== bytes2[i];
        b2n[i] = Bits2Num(8);

        for (var j = 0; j < 8; j++) {
            xor[i][j] = XOR();
            xor[i][j].a <== n2b[2 * i].out[j];
            xor[i][j].b <== n2b[2 * i + 1].out[j];
            b2n[i].in[j] <== xor[i][j].out;
        }

        out[i] <== b2n[i].out;
    }
}

template WordSelector() {
    signal input condition;
    signal input bytes1[4];
    signal input bytes2[4];
    signal output out[4];

    for (var i = 0; i < 4; i++) {
        out[i] <== condition * (bytes1[i] - bytes2[i]) + bytes2[i];
    }
}
