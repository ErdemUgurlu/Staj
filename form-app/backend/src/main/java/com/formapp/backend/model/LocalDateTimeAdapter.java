package com.formapp.backend.model;

import javax.xml.bind.annotation.adapters.XmlAdapter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * JAXB adapter to marshal/unmarshal java.time.LocalDateTime instances
 * to ISO-8601 formatted strings.
 */
public class LocalDateTimeAdapter extends XmlAdapter<String, LocalDateTime> {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    public LocalDateTime unmarshal(String v) {
        if (v == null || v.isEmpty()) {
            return null;
        }
        return LocalDateTime.parse(v, FORMATTER);
    }

    @Override
    public String marshal(LocalDateTime v) {
        if (v == null) {
            return "";
        }
        return v.format(FORMATTER);
    }
} 