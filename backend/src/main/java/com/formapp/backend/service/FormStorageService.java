package com.formapp.backend.service;

import com.formapp.backend.model.FormSubmission;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FormStorageService {
    
    private final ConcurrentHashMap<String, FormSubmission> formStorage = new ConcurrentHashMap<>();

    public FormSubmission saveForm(String formType, Object formData) {
        String id = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        
        FormSubmission submission = new FormSubmission(
            id, 
            formType, 
            formData, 
            now, 
            "submitted"
        );
        
        formStorage.put(id, submission);
        
        System.out.println("Form saved with ID: " + id);
        return submission;
    }

    public List<FormSubmission> getAllForms() {
        List<FormSubmission> forms = new ArrayList<>(formStorage.values());
        // Sort by submission time (newest first)
        forms.sort((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()));
        return forms;
    }

    public FormSubmission getFormById(String id) {
        return formStorage.get(id);
    }

    public void deleteForm(String id) {
        formStorage.remove(id);
    }

    public int getFormCount() {
        return formStorage.size();
    }

    public List<FormSubmission> getFormsByType(String formType) {
        return formStorage.values().stream()
                .filter(form -> form.getFormType().equals(formType))
                .sorted((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()))
                .toList();
    }
} 