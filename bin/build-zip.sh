#!/bin/sh

rm local-addon-symlinks.zip

echo "Building"
yarn run build

echo "Creating archive... 🎁"
zip -r "local-addon-symlinks.zip" \
	package.json \
	lib/ \
	src/ \
	images/ \
	icon.svg \
	style.css \
	README.md
