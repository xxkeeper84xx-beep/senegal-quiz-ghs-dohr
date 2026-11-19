plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Optionale Release-Signatur über Umgebungsvariablen (z. B. aus GitHub-Secrets)
val keystoreFile = System.getenv("NOTFALL_KEYSTORE")?.let { file(it) }?.takeIf { it.exists() }

android {
    namespace = "de.schule.notfall"
    compileSdk = 35

    defaultConfig {
        applicationId = "de.schule.notfall"
        minSdk = 27
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
        // Vorbelegte Server-Adresse (optional): ./gradlew assembleRelease -PserverUrl=https://notfall.meine-schule.de
        buildConfigField("String", "DEFAULT_SERVER_URL", "\"${project.findProperty("serverUrl") ?: ""}\"")
    }

    signingConfigs {
        if (keystoreFile != null) {
            create("release") {
                storeFile = keystoreFile
                storePassword = System.getenv("NOTFALL_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("NOTFALL_KEY_ALIAS")
                keyPassword = System.getenv("NOTFALL_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = if (keystoreFile != null) signingConfigs.getByName("release") else signingConfigs.getByName("debug")
        }
    }

    buildFeatures { buildConfig = true }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}
