pragma circom  2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/gates.circom";

template MIXCOLUMNS(){
        signal input state[4][4];
        signal output newState[4][4];
        component xtimes[4];    
        var mixConstant[4][4] = [
                [0x02, 0x03 , 0x01, 0x01],
                [0x01, 0x02 , 0x03, 0x01],
                [0x01, 0x01 , 0x02, 0x03],
                [0x03, 0x01 , 0x01, 0x02]
        ];
}

template S0(){
        signal input in[4];
        signal output out;
        signal num2bits[4];
        signal xor[3];
        signal element[4];

        for (var i = 0; i < 4; i++) {
                num2bits[i] = Num2Bits(8);
                num2bits[i].in <== in[i];
        }

        element[0] = XTimes2();
        element[0].in <== num2bits[0].out;

        element[1] = XTIMES(3);
        element[1].in <== num2bits[1].out;

        element[2] =  num2bits[2].out;
        element[3] =  num2bits[3].out;

        // XOR
        xor[0] = XorByte();
        xor[0].a <== element[0].out;
        xor[0].b <== element[1].out;

        xor[1] = XorByte();
        xor[1].a <== xor[0].out;
        xor[1].b <== element[2];

        xor[2] = XorByte();
        xor[2].a <== xor[1].out;
        xor[2].b <== element[3];

        out <== xor[2].out;
}

template XTimes2(){
        signal input in[8];
        signal output out[8];

        component xtimeConstant = Num2Bits(8);
        xtimeConstant.in <== 0x1b;

        component xor[7];

        component isZero = IsZero();
        isZero.in <== in[7];

        out[0] <== 1-isZero.out;
        for (var i = 0; i < 7; i++) {
                xor[i] = XOR();
                xor[i].a <== in[i];
                xor[i].b <== xtimeConstant.out[i+1] * (1-isZero.out);
                out[i+1] <== xor[i].out;
        }
}

template XorByte(){
        signal input a[8];
        signal input b[8];
        signal output out[8];

        component xor[8];
        for (var i = 0; i < 8; i++) {
                xor[i] = XOR();
                xor[i].a <== a[i];
                xor[i].b <== b[i];
                out[i] <== xor[i].out;
        }
}

template XTIMES(n){
        signal input in[8];
        signal output out[8];

        component bits = Num2Bits(8);
        bits.in <== n;

        component xtimes2[7];

        xtimes2[0] = XTimes2();
        xtimes2[0].in <== in;

        for (var i = 1; i < 7; i++) {
                xtimes2[i] = XTimes2();
                xtimes2[i].in <== xtimes2[i-1].out;
        }

        component xor[8];
        component mul[8];
        signal inter[8][8];

        mul[0] = MulByte();
        mul[0].a <== bits.out[0];
        mul[0].b <== in;
        inter[0] <== mul[0].c;

        for (var i = 1; i < 8; i++) {
                mul[i] = MulByte();
                mul[i].a <== bits.out[i];
                mul[i].b <== xtimes2[i-1].out;

                xor[i] = XorByte();
                xor[i].a <== inter[i-1];
                xor[i].b <== mul[i].c;
                inter[i] <== xor[i].out;
        }

        out <== inter[7];
}

template MulByte(){
        signal input a;
        signal input b[8];
        signal output c[8];

        for (var i = 0; i < 8; i++) {
                c[i] <== a * b[i];
        }
}
       