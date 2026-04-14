package com.mcid.auth.api.exceptions;

public class PluginApiException extends RuntimeException {
    public PluginApiException(String message) {
        super(message);
    }

    public PluginApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
