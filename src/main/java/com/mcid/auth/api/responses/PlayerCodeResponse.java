package com.mcid.auth.api.responses;

public class PlayerCodeResponse {
    private String code;
    private String appName;

    public PlayerCodeResponse() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getAppName() {
        return appName;
    }

    public void setAppName(String appName) {
        this.appName = appName;
    }

    @Override
    public String toString() {
        return "PlayerCodeResponse{" +
                "code='" + code + '\'' +
                ", appName='" + appName + '\'' +
                '}';
    }
}