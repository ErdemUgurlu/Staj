package com.formapp.backend.model;

import javax.xml.bind.annotation.*;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import java.time.LocalDateTime;
import java.util.Map;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class ActivityLog {
    @XmlElement
    private String id;

    @XmlElement
    private String action;

    @XmlElement
    private String entityType;

    @XmlElement
    private String entityId;

    @XmlElement
    private String description;

    @XmlElement
    private Map<String, Object> entityData;

    @XmlElement
    @XmlJavaTypeAdapter(LocalDateTimeAdapter.class)
    private LocalDateTime timestamp;

    public ActivityLog() {
        this.timestamp = LocalDateTime.now();
    }

    public ActivityLog(String action, String entityType, String entityId, String description, Map<String, Object> entityData) {
        this();
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.description = description;
        this.entityData = entityData;
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
} 