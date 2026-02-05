package com.mcid.auth.api.exceptions;


public class PlayerCodeNotFoundException extends RuntimeException {
    public PlayerCodeNotFoundException(String message) {
        super(message);
    }

    public PlayerCodeNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}