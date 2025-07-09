package com.formapp.backend.service;

import com.formapp.backend.model.*;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;
import javax.xml.bind.annotation.*;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class XmlStorageService {
    private static final String DATA_DIR = "data";
    private static final String BROADCASTS_FILE = DATA_DIR + "/broadcasts.xml";
    private static final String MESSAGES_FILE = DATA_DIR + "/messages.xml";
    private static final String SCENARIOS_FILE = DATA_DIR + "/scenarios.xml";
    private static final String ACTIVITY_LOGS_FILE = DATA_DIR + "/activity_logs.xml";
    private static final String FORM_SUBMISSIONS_FILE = DATA_DIR + "/form_submissions.xml";

    public XmlStorageService() {
        // Create data directory if it doesn't exist
        new File(DATA_DIR).mkdirs();
    }

    @XmlRootElement(name = "broadcastList")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class BroadcastList {
        @XmlElement(name = "broadcasts")
        private List<Broadcast> broadcasts = new ArrayList<>();

        public List<Broadcast> getBroadcasts() {
            return broadcasts;
        }

        public void setBroadcasts(List<Broadcast> broadcasts) {
            this.broadcasts = broadcasts;
        }
    }

    @XmlRootElement(name = "messageList")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class MessageList {
        @XmlElement(name = "messages")
        private List<Message> messages = new ArrayList<>();

        public List<Message> getMessages() {
            return messages;
        }

        public void setMessages(List<Message> messages) {
            this.messages = messages;
        }
    }

    @XmlRootElement(name = "scenarioList")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class ScenarioList {
        @XmlElement(name = "scenarios")
        private List<Scenario> scenarios = new ArrayList<>();

        public List<Scenario> getScenarios() {
            return scenarios;
        }

        public void setScenarios(List<Scenario> scenarios) {
            this.scenarios = scenarios;
        }
    }

    @XmlRootElement(name = "activityLogList")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class ActivityLogList {
        @XmlElement(name = "activityLogs")
        private List<ActivityLog> activityLogs = new ArrayList<>();

        public List<ActivityLog> getActivityLogs() {
            return activityLogs;
        }

        public void setActivityLogs(List<ActivityLog> activityLogs) {
            this.activityLogs = activityLogs;
        }
    }

    @XmlRootElement(name = "formSubmissionList")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class FormSubmissionList {
        @XmlElement(name = "formSubmissions")
        private List<FormSubmission> formSubmissions = new ArrayList<>();

        public List<FormSubmission> getFormSubmissions() {
            return formSubmissions;
        }

        public void setFormSubmissions(List<FormSubmission> formSubmissions) {
            this.formSubmissions = formSubmissions;
        }
    }

    // Broadcast methods
    public List<Broadcast> loadBroadcasts() {
        try {
            File file = new File(BROADCASTS_FILE);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            JAXBContext context = JAXBContext.newInstance(BroadcastList.class);
            Unmarshaller unmarshaller = context.createUnmarshaller();
            BroadcastList list = (BroadcastList) unmarshaller.unmarshal(file);
            return list.getBroadcasts();
        } catch (JAXBException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public void saveBroadcasts(List<Broadcast> broadcasts) {
        try {
            JAXBContext context = JAXBContext.newInstance(BroadcastList.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            BroadcastList list = new BroadcastList();
            list.setBroadcasts(broadcasts);
            marshaller.marshal(list, new File(BROADCASTS_FILE));
        } catch (JAXBException e) {
            e.printStackTrace();
        }
    }

    // Message methods
    public List<Message> loadMessages() {
        try {
            File file = new File(MESSAGES_FILE);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            JAXBContext context = JAXBContext.newInstance(MessageList.class);
            Unmarshaller unmarshaller = context.createUnmarshaller();
            MessageList list = (MessageList) unmarshaller.unmarshal(file);
            return list.getMessages();
        } catch (JAXBException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public void saveMessages(List<Message> messages) {
        try {
            JAXBContext context = JAXBContext.newInstance(MessageList.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            MessageList list = new MessageList();
            list.setMessages(messages);
            marshaller.marshal(list, new File(MESSAGES_FILE));
        } catch (JAXBException e) {
            e.printStackTrace();
        }
    }

    // Scenario methods
    public List<Scenario> loadScenarios() {
        try {
            File file = new File(SCENARIOS_FILE);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            JAXBContext context = JAXBContext.newInstance(ScenarioList.class);
            Unmarshaller unmarshaller = context.createUnmarshaller();
            ScenarioList list = (ScenarioList) unmarshaller.unmarshal(file);
            return list.getScenarios();
        } catch (JAXBException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public void saveScenarios(List<Scenario> scenarios) {
        try {
            JAXBContext context = JAXBContext.newInstance(ScenarioList.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            ScenarioList list = new ScenarioList();
            list.setScenarios(scenarios);
            marshaller.marshal(list, new File(SCENARIOS_FILE));
        } catch (JAXBException e) {
            e.printStackTrace();
        }
    }

    // ActivityLog methods
    public List<ActivityLog> loadActivityLogs() {
        try {
            File file = new File(ACTIVITY_LOGS_FILE);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            JAXBContext context = JAXBContext.newInstance(ActivityLogList.class);
            Unmarshaller unmarshaller = context.createUnmarshaller();
            ActivityLogList list = (ActivityLogList) unmarshaller.unmarshal(file);
            return list.getActivityLogs();
        } catch (JAXBException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public void saveActivityLogs(List<ActivityLog> activityLogs) {
        try {
            JAXBContext context = JAXBContext.newInstance(ActivityLogList.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            ActivityLogList list = new ActivityLogList();
            list.setActivityLogs(activityLogs);
            marshaller.marshal(list, new File(ACTIVITY_LOGS_FILE));
        } catch (JAXBException e) {
            e.printStackTrace();
        }
    }

    // FormSubmission methods
    public List<FormSubmission> loadFormSubmissions() {
        try {
            File file = new File(FORM_SUBMISSIONS_FILE);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            JAXBContext context = JAXBContext.newInstance(FormSubmissionList.class);
            Unmarshaller unmarshaller = context.createUnmarshaller();
            FormSubmissionList list = (FormSubmissionList) unmarshaller.unmarshal(file);
            return list.getFormSubmissions();
        } catch (JAXBException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public void saveFormSubmissions(List<FormSubmission> formSubmissions) {
        try {
            JAXBContext context = JAXBContext.newInstance(FormSubmissionList.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            FormSubmissionList list = new FormSubmissionList();
            list.setFormSubmissions(formSubmissions);
            marshaller.marshal(list, new File(FORM_SUBMISSIONS_FILE));
        } catch (JAXBException e) {
            e.printStackTrace();
        }
    }
} 