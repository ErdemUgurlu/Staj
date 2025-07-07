package com.formapp.backend.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "messages")
public class Message implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String messageName;
    
    @Column(nullable = false)
    private String messageType; // yayinEkle, yayinBaslat, yayinDurdur, etc.
    
    @Column(columnDefinition = "TEXT")
    private String parameters; // JSON string for message parameters
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private boolean sent = false; // TCP ile gönderildi mi?

    @Column(nullable = false, name = "saved")
    private boolean saved = false; // Mesaj veritabanında saklandı mı?

    public Message() {
        this.createdAt = LocalDateTime.now();
    }

    public Message(String messageName, String messageType, String parameters) {
        this();
        this.messageName = messageName;
        this.messageType = messageType;
        this.parameters = parameters;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMessageName() {
        return messageName;
    }

    public void setMessageName(String messageName) {
        this.messageName = messageName;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public String getParameters() {
        return parameters;
    }

    public void setParameters(String parameters) {
        this.parameters = parameters;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isSent() {
        return sent;
    }

    public void setSent(boolean sent) {
        this.sent = sent;
    }

    public boolean isSaved() {
        return saved;
    }

    public void setSaved(boolean saved) {
        this.saved = saved;
    }

    @Override
    public String toString() {
        return "Message{" +
                "id='" + id + '\'' +
                ", messageName='" + messageName + '\'' +
                ", messageType='" + messageType + '\'' +
                ", parameters='" + parameters + '\'' +
                ", createdAt=" + createdAt +
                ", sent=" + sent +
                ", saved=" + saved +
                '}';
    }
} 