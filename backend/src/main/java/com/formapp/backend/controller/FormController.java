package com.formapp.backend.controller;

import com.formapp.backend.model.FormSubmission;
import com.formapp.backend.model.FormType1;
import com.formapp.backend.model.FormType2;
import com.formapp.backend.service.FormStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.ObjectOutputStream;
import java.util.List;

@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = "http://localhost:3000") // Allow React frontend
public class FormController {

    @Autowired
    private FormStorageService formStorageService;

    @PostMapping("/type1")
    public ResponseEntity<FormSubmission> submitFormType1(@RequestBody FormType1 form) {
        try {
            // Convert form to byte array (dummy implementation)
            byte[] formBytes = convertToByteArray(form);
            
            // Save form to storage
            FormSubmission savedForm = formStorageService.saveForm("FormType1", form);
            
            // TODO: Here we would send via TCP to server
            // For now, just log the received data
            System.out.println("Received FormType1: " + form);
            System.out.println("Converted to byte array of length: " + formBytes.length);
            
            // Dummy TCP send simulation
            boolean tcpSendSuccess = sendViaTcp(formBytes);
            
            if (tcpSendSuccess) {
                return ResponseEntity.ok(savedForm);
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/type2")
    public ResponseEntity<FormSubmission> submitFormType2(@RequestBody FormType2 form) {
        try {
            // Convert form to byte array (dummy implementation)
            byte[] formBytes = convertToByteArray(form);
            
            // Save form to storage
            FormSubmission savedForm = formStorageService.saveForm("FormType2", form);
            
            // TODO: Here we would send via TCP to server
            // For now, just log the received data
            System.out.println("Received FormType2: " + form);
            System.out.println("Converted to byte array of length: " + formBytes.length);
            
            // Dummy TCP send simulation
            boolean tcpSendSuccess = sendViaTcp(formBytes);
            
            if (tcpSendSuccess) {
                return ResponseEntity.ok(savedForm);
                
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<FormSubmission>> getAllForms() {
        try {
            List<FormSubmission> forms = formStorageService.getAllForms();
            return ResponseEntity.ok(forms);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/type/{formType}")
    public ResponseEntity<List<FormSubmission>> getFormsByType(@PathVariable String formType) {
        try {
            List<FormSubmission> forms = formStorageService.getFormsByType(formType);
            return ResponseEntity.ok(forms);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormSubmission> getFormById(@PathVariable String id) {
        try {
            FormSubmission form = formStorageService.getFormById(id);
            if (form != null) {
                return ResponseEntity.ok(form);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteForm(@PathVariable String id) {
        try {
            formStorageService.deleteForm(id);
            return ResponseEntity.ok("Form deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting form");
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getFormCount() {
        try {
            int count = formStorageService.getFormCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private byte[] convertToByteArray(Object obj) throws Exception {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(bos);
        oos.writeObject(obj);
        oos.flush();
        return bos.toByteArray();
    }

    private boolean sendViaTcp(byte[] data) {
        // Dummy implementation - always returns true
     
        System.out.println("Dummy TCP send of " + data.length + " bytes");
        return true;
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Form service is running");
    }
} 