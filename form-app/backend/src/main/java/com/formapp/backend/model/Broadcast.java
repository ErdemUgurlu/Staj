package com.formapp.backend.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "broadcasts")
public class Broadcast implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String name; // Yayın ismi
    
    @Column(nullable = false)
    private Float amplitude;
    
    @Column(nullable = false)
    private Float pri;
    
    @Column(nullable = false)
    private Float direction;
    
    @Column(nullable = false)
    private Float pulseWidth;
    
    @Column(nullable = false)
    private boolean active = true; // Default to active
    
    @Column(nullable = false)
    private boolean tcpSent = false; // TCP ile gönderildi mi?
    
    @Column
    private String scenarioId; // Link to scenario if exists

    public Broadcast() {}

    public Broadcast(String id, String name, Float amplitude, Float pri, Float direction, Float pulseWidth) {
        this.id = id;
        this.name = name;
        this.amplitude = amplitude;
        this.pri = pri;
        this.direction = direction;
        this.pulseWidth = pulseWidth;
        this.active = true;
        this.tcpSent = false;
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

    public Float getAmplitude() {
        return amplitude;
    }

    public void setAmplitude(Float amplitude) {
        this.amplitude = amplitude;
    }

    public Float getPri() {
        return pri;
    }

    public void setPri(Float pri) {
        this.pri = pri;
    }

    public Float getDirection() {
        return direction;
    }

    public void setDirection(Float direction) {
        this.direction = direction;
    }

    public Float getPulseWidth() {
        return pulseWidth;
    }

    public void setPulseWidth(Float pulseWidth) {
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

    public String getScenarioId() {
        return scenarioId;
    }

    public void setScenarioId(String scenarioId) {
        this.scenarioId = scenarioId;
    }

    @Override
    public String toString() {
        return "Broadcast{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", amplitude=" + amplitude +
                ", pri=" + pri +
                ", direction=" + direction +
                ", pulseWidth=" + pulseWidth +
                ", active=" + active +
                ", tcpSent=" + tcpSent +
                ", scenarioId='" + scenarioId + '\'' +
                '}';
    }
} 