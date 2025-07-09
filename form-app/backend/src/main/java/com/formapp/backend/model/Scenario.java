package com.formapp.backend.model;

import javax.xml.bind.annotation.*;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class Scenario {
    @XmlElement
    private String id;

    @XmlElement
    private String broadcastId;

    @XmlElement
    private Double initialAmplitude;

    @XmlElement
    private Double initialDirection;

    @XmlElement
    private Double finalAmplitude;

    @XmlElement
    private Double finalDirection;

    @XmlElement
    private Double duration; // in seconds

    @XmlElement
    private Double updateFrequency; // in seconds

    @XmlElement
    private Boolean isActive = true;

    @XmlElement
    private Long startTime; // timestamp

    // Constructors
    public Scenario() {}

    public Scenario(String broadcastId, Double initialAmplitude, Double initialDirection,
                   Double finalAmplitude, Double finalDirection, Double duration, Double updateFrequency) {
        this.broadcastId = broadcastId;
        this.initialAmplitude = initialAmplitude;
        this.initialDirection = initialDirection;
        this.finalAmplitude = finalAmplitude;
        this.finalDirection = finalDirection;
        this.duration = duration;
        this.updateFrequency = updateFrequency;
        this.startTime = System.currentTimeMillis();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBroadcastId() {
        return broadcastId;
    }

    public void setBroadcastId(String broadcastId) {
        this.broadcastId = broadcastId;
    }

    public Double getInitialAmplitude() {
        return initialAmplitude;
    }

    public void setInitialAmplitude(Double initialAmplitude) {
        this.initialAmplitude = initialAmplitude;
    }

    public Double getInitialDirection() {
        return initialDirection;
    }

    public void setInitialDirection(Double initialDirection) {
        this.initialDirection = initialDirection;
    }

    public Double getFinalAmplitude() {
        return finalAmplitude;
    }

    public void setFinalAmplitude(Double finalAmplitude) {
        this.finalAmplitude = finalAmplitude;
    }

    public Double getFinalDirection() {
        return finalDirection;
    }

    public void setFinalDirection(Double finalDirection) {
        this.finalDirection = finalDirection;
    }

    public Double getDuration() {
        return duration;
    }

    public void setDuration(Double duration) {
        this.duration = duration;
    }

    public Double getUpdateFrequency() {
        return updateFrequency;
    }

    public void setUpdateFrequency(Double updateFrequency) {
        this.updateFrequency = updateFrequency;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Long getStartTime() {
        return startTime;
    }

    public void setStartTime(Long startTime) {
        this.startTime = startTime;
    }
} 