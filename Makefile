run:
	python -m SimpleHTTPServer 8000

# steps to make a geojson file from dxf
# https://gis.stackexchange.com/questions/122392/ogr2ogr-convert-dxf-to-geojson-with-defined-geometry
# ogr2ogr -f 'GeoJSON' -t_srs EPSG:4326 test.json combined-drawing-no-hatch.dxf
#
# https://geovation.github.io/build-your-own-static-vector-tile-pipeline
# tippecanoe --no-feature-limit --no-tile-size-limit --exclude-all --minimum-zoom=5 --maximum-zoom=g --output-to-directory "build/www/tiles" `find ./build/geojson -type f | grep .json`
