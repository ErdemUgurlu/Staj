package com.formapp.backend.model;

import javax.xml.bind.annotation.*;
import java.math.BigDecimal;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class Broadcast {
    @XmlElement
    private String id;

    @XmlElement
    private String name;

    @XmlElement
    private BigDecimal amplitude;

    @XmlElement
    private BigDecimal pri;

    @XmlElement
    private BigDecimal direction;

    @XmlElement
    private BigDecimal pulseWidth;

    @XmlElement
    private boolean active;

    @XmlElement
    private boolean tcpSent;

    public Broadcast() {
        this.active = false;
        this.tcpSent = false;
    }

    public Broadcast(String name, BigDecimal amplitude, BigDecimal pri, BigDecimal direction, BigDecimal pulseWidth) {
        this();
        this.name = name;
        this.amplitude = amplitude;
        this.pri = pri;
        this.direction = direction;
        this.pulseWidth = pulseWidth;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getAmplitude() {
        return amplitude;
    }

    public void setAmplitude(BigDecimal amplitude) {
        this.amplitude = amplitude;
    }

    public BigDecimal getPri() {
        return pri;
    }

    public void setPri(BigDecimal pri) {
        this.pri = pri;
    }

    public BigDecimal getDirection() {
        return direction;
    }

    public void setDirection(BigDecimal direction) {
        this.direction = direction;
    }

    public BigDecimal getPulseWidth() {
        return pulseWidth;
    }

    public void setPulseWidth(BigDecimal pulseWidth) {
        this.pulseWidth = pulseWidth;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isTcpSent() {
        return tcpSent;
    }

    public void setTcpSent(boolean tcpSent) {
        this.tcpSent = tcpSent;
    }
} 