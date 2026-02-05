package com.mcid.auth.config;

import com.velocitypowered.api.plugin.PluginContainer;
import com.velocitypowered.api.proxy.ProxyServer;
import dev.dejvokep.boostedyaml.YamlDocument;
import dev.dejvokep.boostedyaml.dvs.versioning.BasicVersioning;
import dev.dejvokep.boostedyaml.settings.dumper.DumperSettings;
import dev.dejvokep.boostedyaml.settings.general.GeneralSettings;
import dev.dejvokep.boostedyaml.settings.loader.LoaderSettings;
import dev.dejvokep.boostedyaml.settings.updater.UpdaterSettings;
import org.slf4j.Logger;

import java.io.File;
import java.io.IOException;
import java.util.Objects;
import java.util.Optional;

public class ConfigLoader {
    private final YamlDocument config;
    private final Logger logger;

    public ConfigLoader(File dataFolder, Logger logger, ProxyServer proxy) {
        this.logger = logger;

        YamlDocument finalConfig;
        try {
            finalConfig = YamlDocument.create(new File(dataFolder, "config.yml"),
                    Objects.requireNonNull(getClass().getResourceAsStream("/config.yml")),
                    GeneralSettings.DEFAULT,
                    LoaderSettings.builder().setAutoUpdate(true).build(),
                    DumperSettings.DEFAULT,
                    UpdaterSettings.builder()
                            .setVersioning(new BasicVersioning("file-version"))
                            .setOptionSorting(UpdaterSettings.OptionSorting.SORT_BY_DEFAULTS).build()
            );
            finalConfig.update();
            finalConfig.save();
        } catch (IOException ex) {
            finalConfig = null;
            logger.error("Failed to load the config file!\n This plugin is going to be disabled.");
            Optional<PluginContainer> container = proxy.getPluginManager().getPlugin("mc-id-auth");
            container.ifPresent(pluginContainer -> pluginContainer.getExecutorService().shutdown());
        }
        this.config = finalConfig;
    }

    public YamlDocument getConfig() {
        return config;
    }

    public void save() {
        try {
            config.save();
            this.logger.info("Successfully saved the configuration!");
        } catch (IOException e) {
            this.logger.error("Could not save the configuration.");
        }
    }

    public void reload() {
        try {
            config.reload();
            this.logger.info("Successfully reloaded the configuration!");
        } catch (IOException ex) {
            this.logger.error("Couldn't reload the configuration.");
        }
    }

}

