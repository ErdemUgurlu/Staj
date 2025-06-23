package com.formapp.backend.model;

import java.io.Serializable;
import java.time.LocalDateTime;

public class FormSubmission implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String id;
    private String formType;
    private Object formData;
    private LocalDateTime submittedAt;
    private String status;

    public FormSubmission() {}

    public FormSubmission(String id, String formType, Object formData, LocalDateTime submittedAt, String status) {
        this.id = id;
        this.formType = formType;
        this.formData = formData;
        this.submittedAt = submittedAt;
        this.status = status;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFormType() {
        return formType;
    }

    public void setFormType(String formType) {
        this.formType = formType;
    }

    public Object getFormData() {
        return formData;
    }

    public void setFormData(Object formData) {
        this.formData = formData;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "FormSubmission{" +
                "id='" + id + '\'' +
                ", formType='" + formType + '\'' +
                ", formData=" + formData +
                ", submittedAt=" + submittedAt +
                ", status='" + status + '\'' +
                '}';
    }
} 