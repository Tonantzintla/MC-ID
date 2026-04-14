package com.mcid.auth;

import com.google.inject.Inject;
import com.mcid.auth.api.ApiHandler;
import com.mcid.auth.api.exceptions.PlayerCodeNotFoundException;
import com.mcid.auth.api.exceptions.PluginApiResponseException;
import com.mcid.auth.api.exceptions.PluginApiUnauthorizedException;
import com.mcid.auth.config.ConfigLoader;
import com.mcid.auth.heartbeat.HeartbeatHandler;
import com.velocitypowered.api.event.EventTask;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.proxy.ProxyInitializeEvent;
import com.velocitypowered.api.event.proxy.ProxyShutdownEvent;
import com.velocitypowered.api.plugin.Plugin;
import com.velocitypowered.api.plugin.annotation.DataDirectory;
import com.velocitypowered.api.proxy.Player;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.slf4j.Logger;

import java.nio.file.Path;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;

@Plugin(id = "mc-id-auth", name = "MC-ID Auth", version = BuildConstants.VERSION, authors = {"Tonantzintla"})
public class Auth {

    private final Logger logger;
    private final Path dataDir;
    private ApiHandler apiHandler;
    private HeartbeatHandler heartbeatHandler;
    private String startupFailureMessage;

    @Inject
    public Auth(Logger logger, @DataDirectory Path dataDir) {
        this.logger = logger;
        this.dataDir = dataDir;

        logger.info("Initialized user auth plugin!");
    }


    @Subscribe
    public void onProxyInitialization(ProxyInitializeEvent event) {
        ConfigLoader config;
        try {
            config = new ConfigLoader(dataDir.toFile(), this.logger);
            validateConfig(config);
        } catch (RuntimeException e) {
            this.startupFailureMessage = "This verification server is misconfigured. Please contact the server owner.";
            this.logger.error("MC-ID Auth failed to initialize.", e);
            return;
        }

        this.apiHandler = new ApiHandler(config, this.logger);

        if (config.getConfig().getBoolean("heartbeat.enabled", false)) {
            this.heartbeatHandler = new HeartbeatHandler(config, this.logger);
        }
    }

    @Subscribe
    public void onProxyShutdown(ProxyShutdownEvent event) {
        if (this.heartbeatHandler != null) {
            this.heartbeatHandler.shutdown();
        }
    }

    @Subscribe
    public EventTask onLogin(com.velocitypowered.api.event.connection.LoginEvent event) {
        Player player = event.getPlayer();

        if (this.apiHandler == null) {
            deny(event, this.startupFailureMessage != null
                    ? this.startupFailureMessage
                    : "This verification server is temporarily unavailable. Please contact the server owner.");
            return EventTask.resumeWhenComplete(CompletableFuture.completedFuture(null));
        }

        CompletableFuture<Void> loginTask = this.apiHandler.getPlayerCode(player.getUniqueId())
                .thenAccept(response -> denyWithCode(event, response.getCode()))
                .exceptionally(err -> {
                    handleLoginFailure(event, player, unwrap(err));
                    return null;
                });

        return EventTask.resumeWhenComplete(loginTask);
    }

    private void validateConfig(ConfigLoader configLoader) {
        String apiEndpoint = configLoader.getConfig().getString("api-endpoint", "").trim();
        if (apiEndpoint.isEmpty()) {
            throw new IllegalArgumentException("config.yml is missing api-endpoint");
        }

        String apiKey = configLoader.getConfig().getString("api-key", "").trim();
        if (apiKey.isEmpty() || "ABC123".equals(apiKey)) {
            throw new IllegalArgumentException("config.yml must contain a valid api-key");
        }

        java.net.URI.create(apiEndpoint);
    }

    private void handleLoginFailure(com.velocitypowered.api.event.connection.LoginEvent event, Player player, Throwable error) {
        if (error instanceof PlayerCodeNotFoundException) {
            this.logger.info("No pending verification code for player {}", player.getUniqueId());
            deny(event, "No pending verification code was found for this Minecraft account.");
            return;
        }

        if (error instanceof PluginApiUnauthorizedException) {
            this.logger.error("MC-ID API rejected plugin credentials while verifying player {}", player.getUniqueId(), error);
            deny(event, "This verification server is misconfigured. Please contact the server owner.");
            return;
        }

        if (error instanceof java.net.http.HttpTimeoutException || error instanceof java.net.ConnectException) {
            this.logger.warn("MC-ID API was unreachable while verifying player {}", player.getUniqueId(), error);
            deny(event, "MC-ID is temporarily unavailable. Please try again in a moment.");
            return;
        }

        if (error instanceof PluginApiResponseException) {
            this.logger.error("MC-ID API returned an invalid response while verifying player {}", player.getUniqueId(), error);
            deny(event, "Verification failed due to a temporary server error. Please try again.");
            return;
        }

        this.logger.error("Unexpected error while verifying player {}", player.getUniqueId(), error);
        deny(event, "Verification failed due to a temporary server error. Please try again.");
    }

    private void denyWithCode(com.velocitypowered.api.event.connection.LoginEvent event, String code) {
        String formattedCode = code.substring(0, 3) + " " + code.substring(3);
        Component message = Component.text("Your verification code is:\n\n", NamedTextColor.GOLD)
                .append(Component.text(formattedCode, NamedTextColor.YELLOW))
                .append(Component.text("\n\nReturn to the app or website and enter this code.", NamedTextColor.GRAY));
        event.setResult(com.velocitypowered.api.event.connection.LoginEvent.ComponentResult.denied(message));
    }

    private void deny(com.velocitypowered.api.event.connection.LoginEvent event, String message) {
        event.setResult(com.velocitypowered.api.event.connection.LoginEvent.ComponentResult.denied(
                Component.text(message, NamedTextColor.RED)
        ));
    }

    private Throwable unwrap(Throwable error) {
        Throwable current = error;
        while (current instanceof CompletionException && current.getCause() != null) {
            current = current.getCause();
        }
        return current;
    }
}
