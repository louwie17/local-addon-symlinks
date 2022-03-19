#!/bin/sh

rm symlink-addon.zip

echo "Building"
yarn run build

echo "Creating archive... 🎁"
zip -r "symlink-addon.zip" \
	package.json \
	lib/ \
	images/ \
	icon.svg \
	style.css \
	README.md
