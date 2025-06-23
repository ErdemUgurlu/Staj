package com.formapp.backend.model;

import java.io.Serializable;

public class FormType1 implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Float param1;
    private Float param2;
    private Float param3;
    private Float param4;
    private Float param5;

    public FormType1() {}

    public FormType1(Float param1, Float param2, Float param3, Float param4, Float param5) {
        this.param1 = param1;
        this.param2 = param2;
        this.param3 = param3;
        this.param4 = param4;
        this.param5 = param5;
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

    public Float getParam4() {
        return param4;
    }

    public void setParam4(Float param4) {
        this.param4 = param4;
    }

    public Float getParam5() {
        return param5;
    }

    public void setParam5(Float param5) {
        this.param5 = param5;
    }

    @Override
    public String toString() {
        return "FormType1{" +
                "param1=" + param1 +
                ", param2=" + param2 +
                ", param3=" + param3 +
                ", param4=" + param4 +
                ", param5=" + param5 +
                '}';
    }
} 