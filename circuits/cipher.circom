pragma circom  2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/gates.circom";

template MixColumns(){
    signal input state[4][4];
    signal output out[4][4];

    component s0[4];
    component s1[4];
    component s2[4];
    component s3[4];

    for (var i = 0; i < 4; i++) {
        s0[i] = S0();
        s1[i] = S1();
        s2[i] = S2();
        s3[i] = S3();

        for(var j = 0; j < 4; j++) {
            s0[i].in[j] <== state[j][i];
            s1[i].in[j] <== state[j][i];
            s2[i].in[j] <== state[j][i];
            s3[i].in[j] <== state[j][i];
        }

        out[0][i] <== s0[i].out;
        out[1][i] <== s1[i].out;
        out[2][i] <== s2[i].out;
        out[3][i] <== s3[i].out;
    }
}

template S0(){
    signal input in[4];
    signal output out;
    component num2bits[4];
    component xor[3];

    for (var i = 0; i < 4; i++) {
        num2bits[i] = Num2Bits(8);
        num2bits[i].in <== in[i];
    }

    component mul = XTimes(2);
    mul.in <== num2bits[0].out;

    component mul2 = XTimes(3);
    mul2.in <== num2bits[1].out;

    xor[0] = XorByte();
    xor[0].a <== mul.out;
    xor[0].b <== mul2.out;

    xor[1] = XorByte();
    xor[1].a <== xor[0].out;
    xor[1].b <== num2bits[2].out;

    xor[2] = XorByte();
    xor[2].a <== xor[1].out;
    xor[2].b <== num2bits[3].out;

    component b2n = Bits2Num(8);
    for (var i = 0; i < 8; i++) {
        b2n.in[i] <== xor[2].out[i];
    }

    out <== b2n.out;
}

template S1(){
    signal input in[4];
    signal output out;
    component num2bits[4];
    component xor[3];

    for (var i = 0; i < 4; i++) {
        num2bits[i] = Num2Bits(8);
        num2bits[i].in <== in[i];
    }

    component mul = XTimes(2);
    mul.in <== num2bits[1].out;

    component mul2 = XTimes(3);
    mul2.in <== num2bits[2].out;

    xor[0] = XorByte();
    xor[0].a <== num2bits[0].out;
    xor[0].b <== mul.out;

    xor[1] = XorByte();
    xor[1].a <== xor[0].out;
    xor[1].b <== mul2.out;

    xor[2] = XorByte();
    xor[2].a <== xor[1].out;
    xor[2].b <== num2bits[3].out;

    component b2n = Bits2Num(8);
    for (var i = 0; i < 8; i++) {
        b2n.in[i] <== xor[2].out[i];
    }

    out <== b2n.out;
}

template S2() { 
    signal input in[4];
    signal output out;
    component num2bits[4];
    component xor[3];

    for (var i = 0; i < 4; i++) {
        num2bits[i] = Num2Bits(8);
        num2bits[i].in <== in[i];
    }

    xor[0] = XorByte();
    xor[0].a <== num2bits[0].out;
    xor[0].b <== num2bits[1].out;

    component mul2 = XTimes2();
    mul2.in <== num2bits[2].out;

    component mul = XTimes(3);
    mul.in <== num2bits[3].out;

    xor[1] = XorByte();
    xor[1].a <== xor[0].out;
    xor[1].b <== mul2.out;

    xor[2] = XorByte();
    xor[2].a <== xor[1].out;
    xor[2].b <== mul.out;

    component b2n = Bits2Num(8);
    for (var i = 0; i < 8; i++) {
        b2n.in[i] <== xor[2].out[i];
    }

    out <== b2n.out;
}

template S3() {
    signal input in[4];
    signal output out;
    component num2bits[4];
    component xor[3];

    for (var i = 0; i < 4; i++) {
        num2bits[i] = Num2Bits(8);
        num2bits[i].in <== in[i];
    }

    component mul3 = XTimes(3);
    mul3.in <== num2bits[0].out;

    xor[0] = XorByte();
    xor[0].a <== mul3.out;
    xor[0].b <== num2bits[1].out;

    xor[1] = XorByte();
    xor[1].a <== xor[0].out;
    xor[1].b <== num2bits[2].out;

    component mul2 = XTimes2();
    mul2.in <== num2bits[3].out;

    xor[2] = XorByte();
    xor[2].a <== mul2.out;
    xor[2].b <== xor[1].out;

    component b2n = Bits2Num(8);
    for (var i = 0; i < 8; i++) {
        b2n.in[i] <== xor[2].out[i];
    }

    out <== b2n.out;
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

template XTimes(n){
        signal input in[8];
        signal output out[8];

        component bits = Num2Bits(8);
        bits.in <== n;

        component XTimes2[7];

        XTimes2[0] = XTimes2();
        XTimes2[0].in <== in;

        for (var i = 1; i < 7; i++) {
                XTimes2[i] = XTimes2();
                XTimes2[i].in <== XTimes2[i-1].out;
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
                mul[i].b <== XTimes2[i-1].out;

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
       