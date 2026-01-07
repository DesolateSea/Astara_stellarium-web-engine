# Stellarium Web - Copyright (c) 2019 - Noctua Software Ltd
#
# This program is licensed under the terms of the GNU AGPL v3, or
# alternatively under a commercial licence.
#
# The terms of the AGPL v3 license can be found in the main directory of this
# repository.

# Get App ID from capacitor.config.json
APP_ID := $(shell grep -o '"appId"[[:space:]]*:[[:space:]]*"[^"]*"' capacitor.config.json | sed 's/.*"appId"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')

.PHONY: setup build dev start

gen-es6:
	cd ../.. && docker run -it -p 8000:8000 -v "$(PWD)/../..:/app:Z" swe-dev /bin/bash -c "source /emsdk/emsdk_env.sh && make js-es6"

gen-es6-debug:
	cd ../.. && docker run -it -p 8000:8000 -v "$(PWD)/../..:/app:Z" swe-dev /bin/bash -c "source /emsdk/emsdk_env.sh && make js-es6-debug"

gen-es6-prof:
	cd ../.. && docker run -it -p 8000:8000 -v "$(PWD)/../..:/app:Z"  swe-dev /bin/bash -c "source /emsdk/emsdk_env.sh && make js-es6-prof"

update-engine:
	make gen-es6
	cp ../../build/stellarium-web-engine.js src/assets/js/
	cp ../../build/stellarium-web-engine.wasm src/assets/js/

update-engine-debug:
	make gen-es6-debug
	cp ../../build/stellarium-web-engine.js src/assets/js/
	cp ../../build/stellarium-web-engine.wasm src/assets/js/

USER_UID := $(shell id -u)
USER_GID := $(shell id -g)

DOCKER_MOUNTS := -v "$(PWD):/app:Z" -v "$(PWD)/public/skydata:/skydata:Z" $(EXTRA_DOCKER_MOUNTS)

setup: Dockerfile Dockerfile.jsbuild
	# Build docker image for compilation with emscripten
	docker build -f Dockerfile.jsbuild -t swe-dev . # --no-cache
	make update-engine
	# Build docker image for webpack/node development
	docker build -t stellarium-web-dev --build-arg USER_UID=${USER_UID} --build-arg USER_GID=${USER_GID} .
	docker run -it $(DOCKER_MOUNTS) stellarium-web-dev yarn install

dev:
	docker run -it -p 8080:8080 -p 8888:8888 $(DOCKER_MOUNTS) stellarium-web-dev yarn run dev

lint:
	docker run -it -p 8080:8080 -p 8888:8888 $(DOCKER_MOUNTS) stellarium-web-dev yarn run lint

build:
	docker run -it $(DOCKER_MOUNTS) stellarium-web-dev yarn run build

start:
	cd dist && python3 -m http.server 7070

i18n:
	python3 ./tools/update-i18n-en.py

# Initialize Capacitor Android platform (run once)
android:
	npx cap add android

# Sync web build to Android project (run after building frontend)
sync-android:
	npx cap sync android

# Build debug APK using Gradle
build-apk:
	cd android && ./gradlew assembleDebug

# Open Android project in Android Studio
open-android:
	npx cap open android

# Install debug APK on connected device via adb
install-apk:
	adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Uninstall app from connected device if installed
uninstall:
	@if adb shell pm list packages | grep -q $(APP_ID); then \
		echo "Uninstalling app $(APP_ID)"; \
		adb uninstall $(APP_ID); \
	else \
		echo "App $(APP_ID) is not installed"; \
	fi

