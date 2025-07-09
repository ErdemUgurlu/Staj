package com.formapp.backend.model;

import jakarta.xml.bind.annotation.adapters.XmlAdapter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

/**
 * XML adapter to marshal/unmarshal Map<String, Object> instances
 * to JSON strings for XML storage.
 */
public class JsonMapConverter extends XmlAdapter<String, Map<String, Object>> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Map<String, Object> unmarshal(String v) {
        if (v == null || v.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(v, Map.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting JSON string to Map", e);
        }
    }

    @Override
    public String marshal(Map<String, Object> v) {
        if (v == null) {
            return "";
        }
        try {
            return objectMapper.writeValueAsString(v);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting Map to JSON string", e);
        }
    }

    public static Map<String, Object> parseJsonString(String jsonString) {
        try {
            return objectMapper.readValue(jsonString, Map.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing JSON string", e);
        }
    }
}