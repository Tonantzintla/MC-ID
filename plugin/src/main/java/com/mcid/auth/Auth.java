package com.mcid.auth;

import com.google.inject.Inject;
import com.mcid.auth.api.ApiHandler;
import com.mcid.auth.api.exceptions.PlayerCodeNotFoundException;
import com.mcid.auth.config.ConfigLoader;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.proxy.ProxyInitializeEvent;
import com.velocitypowered.api.plugin.Plugin;
import com.velocitypowered.api.plugin.annotation.DataDirectory;
import com.velocitypowered.api.proxy.Player;
import com.velocitypowered.api.proxy.ProxyServer;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import org.slf4j.Logger;

import java.nio.file.Path;

@Plugin(id = "mc-id-auth", name = "MC-ID Auth", version = BuildConstants.VERSION, authors = {"Tonantzintla"})
public class Auth {

    private final ProxyServer proxy;
    private final Logger logger;
    private final Path dataDir;
    private ApiHandler apiHandler;

    @Inject
    public Auth(ProxyServer proxy, Logger logger, @DataDirectory Path dataDir) {
        this.logger = logger;
        this.proxy = proxy;
        this.dataDir = dataDir;

        logger.info("Initialized user auth plugin!");
    }


    @Subscribe
    public void onProxyInitialization(ProxyInitializeEvent event) {
        ConfigLoader config = new ConfigLoader(dataDir.toFile(), this.logger, proxy);
        this.apiHandler = new ApiHandler(config, this.logger);
    }

    @Subscribe
    public void onLogin(com.velocitypowered.api.event.connection.LoginEvent event) {
        Player player = event.getPlayer();


        try {
            com.mcid.auth.api.responses.PlayerCodeResponse response = this.apiHandler.getPlayerCode(player.getUniqueId()).join();
            String code = response.getCode();
            String formattedCode = code;
            if (code != null && code.length() == 6) {
                formattedCode = code.substring(0, 3) + " " + code.substring(3);
            }

            assert formattedCode != null;
            assert code != null;
            assert formattedCode != null;
            Component message = Component
                    .text("Your verification code is:\n\n").color(NamedTextColor.GOLD)
                    .append(Component.text(formattedCode)
                            .color(NamedTextColor.YELLOW)
                            .clickEvent(net.kyori.adventure.text.event.ClickEvent.copyToClipboard(code))
                            .hoverEvent(net.kyori.adventure.text.event.HoverEvent.showText(Component.text("Click to copy code"))));
            event.setResult(com.velocitypowered.api.event.connection.LoginEvent.ComponentResult.denied(message));
        } catch (Exception e) {
            if (e.getCause() instanceof PlayerCodeNotFoundException) {
                Component message = Component.text("There was no code requested for you.").color(NamedTextColor.RED);
                event.setResult(com.velocitypowered.api.event.connection.LoginEvent.ComponentResult.denied(message));
            } else {
                this.logger.error("Something went wrong with the API: {}", e.getMessage());
                event.setResult(com.velocitypowered.api.event.connection.LoginEvent.ComponentResult.denied(Component.text("Something went wrong.").color(NamedTextColor.DARK_RED)));
            }
        }
    }


}
