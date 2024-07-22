pragma circom 2.0.0;

include "sbox128.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/gates.circom";

//nk is the number of keys which can be 4, 6, 8 
//nr is the number of rounds which can be 10, 12, 14
template KeyExpansion(nk, nr) {
    signal input key[nk * 4];
    component words[nk];
    signal output keyExpanded[4 * (nr + 1)][4];

    for(var i = 0; i < nk; i++) {
        words[i] = BytesToWords(4);
        for (var j = 0; j < 4; j++) {
            words[i].bytes[j] <== key[(4 * i) + j];
        }
        keyExpanded[i] <== words[i].bytes;
    }

    component rotateWord[4 * (nr + 1) - nk];
    component substituteWord[4 * (nr + 1) - nk];
    component rcon[4 * (nr + 1) - nk];
    component xorWord[4 * (nr + 1) - nk];
    component isFirstWordInRound[4 * (nr + 1) - nk];
    component temp[4 * (nr + 1) - nk];
    component newWord[4 * (nr + 1) - nk];

    for(var i = nk; i < 4 * (nr + 1); i++) {
        rotateWord[i - nk] = RotateWord(1);
        rotateWord[i - nk].bytes <== keyExpanded[i - 1];

        substituteWord[i - nk] = SubstituteWord();
        substituteWord[i - nk].bytes <== rotateWord[i - nk].rotated;

        rcon[i - nk] = RCon();
        rcon[i - nk].round <== i \ nk;

        xorWord[i - nk] = XorWord();
        xorWord[i - nk].bytes1 <== substituteWord[i - nk].substituted;
        xorWord[i - nk].bytes2 <== rcon[i - nk].out;

        isFirstWordInRound[i - nk] = IsZero();
        isFirstWordInRound[i - nk].in <== i % nk;

        temp[i - nk] = WordSelector();
        temp[i - nk].condition <== isFirstWordInRound[i - nk].out;
        temp[i - nk].bytes1 <== xorWord[i - nk].out;
        temp[i - nk].bytes2 <== keyExpanded[i - 1];

        newWord[i - nk] = XorWord();
        newWord[i - nk].bytes1 <== temp[i - nk].out;
        newWord[i - nk].bytes2 <== keyExpanded[i - nk];

        keyExpanded[i] <== newWord[i - nk].out;
    }
}   

template BytesToWords(n) {
    signal input bytes[n];
    signal output words[n / 4][4];

    for (var i = 0; i < n / 4; i++) {
        for(var j = 0; j < 4; j++) {
            words[i][j] <== bytes[i * 4 + j];
        }
    }
}

template RotateWord(rotation) {
    assert(rotation < 4);
    signal input bytes[4];
    signal output rotated[4];

    signal copy[rotation];

    for(var i = 0; i < rotation; i++) {
        copy[i] <== bytes[i];
    }

    for(var i = 0; i < 4 - rotation; i++) {
        rotated[i] <== bytes[i + rotation];
    }

    for(var i = 4 - rotation; i < 4; i++) {
        rotated[i] <== copy[i - 4 + rotation];
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

    component isEqual[10];
    signal sum[10][4];

    for (var i = 0; i < 10; i++) {
        isEqual[i] = IsEqual();
        isEqual[i].in[0] <== round - 1;
        isEqual[i].in[1] <== i;
    }

    sum[0] <== [isEqual[0].out * rcon[0][0], isEqual[1].out * rcon[0][1], isEqual[2].out * rcon[0][2], isEqual[3].out * rcon[0][3]];
    for (var i = 1; i < 10; i++) {
        for (var j = 0; j < 4; j++) {
            sum[i][j] <== sum[i - 1][j] + isEqual[i].out * rcon[i][j];
        }
    }

    out <== sum[9];
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