package com.formapp.backend.controller;

import com.formapp.backend.model.Broadcast;
import com.formapp.backend.model.FormSubmission;
import com.formapp.backend.model.Scenario;
import com.formapp.backend.model.ActivityLog;
import com.formapp.backend.model.Message;
import com.formapp.backend.service.FormStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = "http://localhost:3000") // Allow React frontend
public class FormController {

    @Autowired
    private FormStorageService formStorageService;

    @PostMapping("/broadcast/save")
    public ResponseEntity<FormSubmission> saveBroadcast(@RequestBody Broadcast broadcast) {
        // Generate a unique ID if not provided
        if (broadcast.getId() == null || broadcast.getId().isEmpty()) {
            broadcast.setId(UUID.randomUUID().toString());
        }
        
        // Sadece kaydet, TCP ile gönderme
        broadcast.setTcpSent(false);
        broadcast.setActive(false); // Yeni yayınlar başlangıçta deaktif
        
        FormSubmission savedForm = formStorageService.saveForm("Broadcast", broadcast);
        System.out.println("Broadcast saved (not sent via TCP): " + broadcast);
        return ResponseEntity.ok(savedForm);
    }

    @PostMapping("/broadcast/send")
    public ResponseEntity<FormSubmission> sendBroadcastTcp(@RequestBody Broadcast broadcast) {
        // Generate a unique ID if not provided
        if (broadcast.getId() == null || broadcast.getId().isEmpty()) {
            broadcast.setId(UUID.randomUUID().toString());
        }
        
        // TCP ile gönder ve kaydet
        broadcast.setTcpSent(true);
        broadcast.setActive(false); // TCP'ye gönderildi ama henüz başlatılmadı
        
        // TODO: TCP YAYIN EKLE MESAJI - Gerçek TCP gönderim işlemi yapılacak
        // tcpService.sendBroadcastAdd(broadcast);
        System.out.println("TCP DUMMY: Broadcasting ADD message for: " + broadcast.getName());
        
        FormSubmission savedForm = formStorageService.saveForm("Broadcast", broadcast);
        System.out.println("Broadcast sent via TCP and saved: " + broadcast);
        return ResponseEntity.ok(savedForm);
    }

    @PostMapping("/broadcast/{id}/send")
    public ResponseEntity<FormSubmission> sendExistingBroadcastTcp(@PathVariable String id) {
        try {
            FormSubmission existingForm = formStorageService.getFormById(id);
            if (existingForm == null) {
                return ResponseEntity.notFound().build();
            }
            
            Broadcast broadcast = (Broadcast) existingForm.getFormData();
            broadcast.setTcpSent(true);
            broadcast.setActive(false); // TCP'ye gönderildi ama henüz başlatılmadı
            
            // TODO: TCP YAYIN EKLE MESAJI - Gerçek TCP gönderim işlemi yapılacak
            // tcpService.sendBroadcastAdd(broadcast);
            System.out.println("TCP DUMMY: Broadcasting ADD message for existing broadcast: " + broadcast.getName());
            
            FormSubmission updatedForm = formStorageService.updateForm(id, "Broadcast", broadcast);
            return ResponseEntity.ok(updatedForm);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/broadcast/{id}/activate")
    public ResponseEntity<FormSubmission> activateBroadcast(@PathVariable String id) {
        try {
            FormSubmission existingForm = formStorageService.getFormById(id);
            if (existingForm == null) {
                return ResponseEntity.notFound().build();
            }
            
            Broadcast broadcast = (Broadcast) existingForm.getFormData();
            
            // Sadece TCP'ye gönderilmiş yayınlar aktif edilebilir
            if (!broadcast.isTcpSent()) {
                return ResponseEntity.badRequest().build();
            }
            
            broadcast.setActive(true);
            
            // TODO: TCP YAYIN BAŞLAT MESAJI - Gerçek TCP başlatma işlemi yapılacak
            // tcpService.sendBroadcastStart(broadcast);
            System.out.println("TCP DUMMY: Broadcasting START message for: " + broadcast.getName());
            
            FormSubmission updatedForm = formStorageService.updateForm(id, "Broadcast", broadcast);
            return ResponseEntity.ok(updatedForm);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/broadcast/{id}/deactivate")
    public ResponseEntity<FormSubmission> deactivateBroadcast(@PathVariable String id) {
        try {
            FormSubmission existingForm = formStorageService.getFormById(id);
            if (existingForm == null) {
                return ResponseEntity.notFound().build();
            }
            
            Broadcast broadcast = (Broadcast) existingForm.getFormData();
            
            // Sadece aktif yayınlar deaktif edilebilir
            if (!broadcast.isActive()) {
                return ResponseEntity.badRequest().build();
            }
            
            broadcast.setActive(false);
            
            // TODO: TCP YAYIN DURDUR MESAJI - Gerçek TCP durdurma işlemi yapılacak
            // tcpService.sendBroadcastStop(broadcast);
            System.out.println("TCP DUMMY: Broadcasting STOP message for: " + broadcast.getName());
            
            FormSubmission updatedForm = formStorageService.updateForm(id, "Broadcast", broadcast);
            return ResponseEntity.ok(updatedForm);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/broadcast")
    public ResponseEntity<FormSubmission> submitBroadcast(@RequestBody Broadcast broadcast) {
        return saveBroadcast(broadcast);
    }

    @PutMapping("/broadcast/{id}")
    public ResponseEntity<FormSubmission> updateBroadcast(@PathVariable String id, @RequestBody Broadcast broadcast) {
        try {
            FormSubmission existingForm = formStorageService.getFormById(id);
            if (existingForm == null) {
                return ResponseEntity.notFound().build();
            }
            broadcast.setId(id); // Ensure ID matches path variable
            FormSubmission updatedForm = formStorageService.updateForm(id, "Broadcast", broadcast);
            return ResponseEntity.ok(updatedForm);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/broadcast/{id}/toggle-active")
    public ResponseEntity<FormSubmission> toggleBroadcastActive(@PathVariable String id) {
        try {
            FormSubmission existingForm = formStorageService.getFormById(id);
            if (existingForm == null) {
                return ResponseEntity.notFound().build();
            }
            
            formStorageService.toggleBroadcastActive(id);
            FormSubmission updatedForm = formStorageService.getFormById(id);
            return ResponseEntity.ok(updatedForm);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Scenario endpoints
    @PostMapping("/scenario")
    public ResponseEntity<Scenario> createScenario(@RequestBody Scenario scenario) {
        try {
            // Check if broadcast exists
            FormSubmission broadcast = formStorageService.getFormById(scenario.getBroadcastId());
            if (broadcast == null) {
                return ResponseEntity.badRequest().build();
            }
            
            Scenario savedScenario = formStorageService.saveScenario(scenario);
            
            return ResponseEntity.ok(savedScenario);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/scenario/broadcast/{broadcastId}")
    public ResponseEntity<Scenario> getScenarioByBroadcastId(@PathVariable String broadcastId) {
        try {
            Scenario scenario = formStorageService.getScenarioByBroadcastId(broadcastId);
            if (scenario != null) {
                return ResponseEntity.ok(scenario);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/scenario/{id}")
    public ResponseEntity<Scenario> getScenarioById(@PathVariable Long id) {
        try {
            Scenario scenario = formStorageService.getScenarioById(id);
            if (scenario != null) {
                return ResponseEntity.ok(scenario);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/scenarios")
    public ResponseEntity<List<Scenario>> getAllScenarios() {
        try {
            List<Scenario> scenarios = formStorageService.getAllScenarios();
            return ResponseEntity.ok(scenarios);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/scenario/{id}")
    public ResponseEntity<Scenario> updateScenario(@PathVariable Long id, @RequestBody Scenario scenario) {
        try {
            Scenario updatedScenario = formStorageService.updateScenario(id, scenario);
            if (updatedScenario != null) {
                return ResponseEntity.ok(updatedScenario);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/scenario/{id}")
    public ResponseEntity<String> deleteScenario(@PathVariable Long id) {
        try {
            Scenario scenario = formStorageService.getScenarioById(id);
            if (scenario != null) {
                formStorageService.deleteScenario(id);
                return ResponseEntity.ok("Scenario deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting scenario");
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<FormSubmission>> listForms() {
        return ResponseEntity.ok(formStorageService.getAllForms());
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
            FormSubmission existingForm = formStorageService.getFormById(id);
            if (existingForm == null) {
                return ResponseEntity.notFound().build();
            }

            // Eğer yayın ise TCP sil mesajı gönder
            if (existingForm.getFormType().equals("Broadcast")) {
                Broadcast broadcast = (Broadcast) existingForm.getFormData();
                
                // TODO: TCP YAYIN SİL MESAJI - Gerçek TCP silme işlemi yapılacak
                // tcpService.sendBroadcastDelete(broadcast);
                System.out.println("TCP DUMMY: Broadcasting DELETE message for: " + broadcast.getName());
            }

            formStorageService.deleteForm(id);
            return ResponseEntity.ok("Form deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
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

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Form service is running");
    }

    // Activity Log endpoints
    @GetMapping("/logs")
    public ResponseEntity<List<ActivityLog>> getAllActivityLogs() {
        try {
            List<ActivityLog> logs = formStorageService.getAllActivityLogs();
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/logs/{id}")
    public ResponseEntity<ActivityLog> getActivityLogById(@PathVariable String id) {
        try {
            ActivityLog log = formStorageService.getActivityLogById(id);
            if (log != null) {
                return ResponseEntity.ok(log);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Message endpoints
    @PostMapping("/message")
    public ResponseEntity<Message> saveMessage(@RequestBody Map<String, Object> messageData) {
        try {
            String messageName = (String) messageData.get("messageName");
            String messageType = (String) messageData.get("type");
            Boolean saveMessage = (Boolean) messageData.get("saveMessage");
            Boolean sendMessage = (Boolean) messageData.get("sendMessage");
            
            // Convert message parameters to JSON string
            String parameters = formStorageService.convertMapToJson(messageData);
            
            Message message = null;
            if (saveMessage != null && saveMessage) {
                // Save message to database
                message = formStorageService.saveMessage(messageName, messageType, parameters);
            }
            
            // Send to TCP if requested
            if (sendMessage != null && sendMessage) {
                // TODO: Send to TCP (dummy for now)
                System.out.println("TCP DUMMY: Sending " + messageType + " message: " + messageName);
                System.out.println("Message parameters: " + parameters);
                
                // If message was saved, mark it as sent
                if (message != null) {
                    message.setSent(true);
                    message = formStorageService.updateMessage(message);
                }
            }
            
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/messages")
    public ResponseEntity<List<Message>> getAllMessages() {
        try {
            List<Message> messages = formStorageService.getAllMessages();
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/messages/{type}")
    public ResponseEntity<List<Message>> getMessagesByType(@PathVariable String type) {
        try {
            List<Message> messages = formStorageService.getMessagesByType(type);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/message/{id}")
    public ResponseEntity<String> deleteMessage(@PathVariable String id) {
        try {
            formStorageService.deleteMessage(id);
            return ResponseEntity.ok("Message deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 