package com.formapp.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "scenarios")
public class Scenario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "broadcast_id", nullable = false)
    private String broadcastId;

    @Column(name = "initial_amplitude", nullable = false)
    private Double initialAmplitude;

    @Column(name = "initial_direction", nullable = false)
    private Double initialDirection;

    @Column(name = "final_amplitude", nullable = false)
    private Double finalAmplitude;

    @Column(name = "final_direction", nullable = false)
    private Double finalDirection;

    @Column(name = "duration", nullable = false)
    private Double duration; // in seconds

    @Column(name = "update_frequency", nullable = false)
    private Double updateFrequency; // in seconds

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "start_time")
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
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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