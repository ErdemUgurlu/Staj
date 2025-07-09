package com.formapp.backend.model;

import javax.xml.bind.annotation.*;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

@XmlRootElement(name = "formSubmission")
@XmlAccessorType(XmlAccessType.FIELD)
public class FormSubmission implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @XmlElement
    private String id;
    
    @XmlElement
    private String formType;
    
    @XmlElement
    @XmlJavaTypeAdapter(JsonMapConverter.class)
    private Map<String, Object> formData;
    
    @XmlElement
    @XmlJavaTypeAdapter(LocalDateTimeAdapter.class)
    private LocalDateTime submittedAt;
    
    @XmlElement
    private String status;

    public FormSubmission() {}

    public FormSubmission(String id, String formType, Object formData, LocalDateTime submittedAt, String status) {
        this.id = id;
        this.formType = formType;
        this.formData = convertToMap(formData);
        this.submittedAt = submittedAt;
        this.status = status;
    }

    private Map<String, Object> convertToMap(Object formData) {
        if (formData instanceof Map) {
            return (Map<String, Object>) formData;
        }
        // For other objects, we can use reflection or manual conversion
        // For now, keeping it simple
        return new java.util.HashMap<>();
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
        this.formData = convertToMap(formData);
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