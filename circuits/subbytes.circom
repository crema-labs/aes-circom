pragma circom 2.0.0;

template SubBytes(n) {
    signal input key[n];
    log("key" , key[0]);

    signal output out;
    out <==1;
}