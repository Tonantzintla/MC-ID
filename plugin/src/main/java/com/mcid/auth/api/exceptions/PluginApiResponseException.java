package com.mcid.auth.api.exceptions;

public class PluginApiResponseException extends PluginApiException {
    public PluginApiResponseException(String message) {
        super(message);
    }

    public PluginApiResponseException(String message, Throwable cause) {
        super(message, cause);
    }
}
