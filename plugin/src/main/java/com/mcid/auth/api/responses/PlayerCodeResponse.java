package com.mcid.auth.api.responses;

public class PlayerCodeResponse {
    private String code;

    public PlayerCodeResponse() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    @Override
    public String toString() {
        return "PlayerCodeResponse{" +
                "code='" + code + '\'' +
                '}';
    }
}