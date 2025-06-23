package com.formapp.backend.model;

import java.io.Serializable;

public class FormType2 implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Float param1;
    private Float param2;
    private Float param3;

    public FormType2() {}

    public FormType2(Float param1, Float param2, Float param3) {
        this.param1 = param1;
        this.param2 = param2;
        this.param3 = param3;
    }

    // Getters and Setters
    public Float getParam1() {
        return param1;
    }

    public void setParam1(Float param1) {
        this.param1 = param1;
    }

    public Float getParam2() {
        return param2;
    }

    public void setParam2(Float param2) {
        this.param2 = param2;
    }

    public Float getParam3() {
        return param3;
    }

    public void setParam3(Float param3) {
        this.param3 = param3;
    }

    @Override
    public String toString() {
        return "FormType2{" +
                "param1=" + param1 +
                ", param2=" + param2 +
                ", param3=" + param3 +
                '}';
    }
} 