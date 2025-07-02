package com.formapp.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String action; // CREATE, UPDATE, DELETE, TOGGLE_ACTIVE, CREATE_SCENARIO, UPDATE_SCENARIO, DELETE_SCENARIO
    
    @Column(nullable = false)
    private String entityType; // BROADCAST, SCENARIO
    
    @Column(nullable = false)
    private String entityId;
    
    @Column(nullable = false)
    private String description;
    
    @Convert(converter = JsonMapConverter.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> entityData; // Snapshot of the entity data at the time of action
    
    @Column(nullable = false)
    private LocalDateTime timestamp;

    // Constructors
    public ActivityLog() {
        this.timestamp = LocalDateTime.now();
    }

    public ActivityLog(String action, String entityType, String entityId, String description, Map<String, Object> entityData) {
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.description = description;
        this.entityData = entityData;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Map<String, Object> getEntityData() {
        return entityData;
    }

    public void setEntityData(Map<String, Object> entityData) {
        this.entityData = entityData;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "ActivityLog{" +
                "id='" + id + '\'' +
                ", action='" + action + '\'' +
                ", entityType='" + entityType + '\'' +
                ", entityId='" + entityId + '\'' +
                ", description='" + description + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
} 