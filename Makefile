# Main compilation statement for emcc: https://emscripten.org/docs/porting/connecting_cpp_and_javascript/embind.html
emsdk_filepath = C:/emcc/emsdk/

test:
	g++ src/main.cpp src/splines.cpp -o test.exe
	test.exe

web:
	$(emsdk_filepath)/emsdk activate latest & emcc -lembind src/splines.cpp src/bindings.cpp -o scripts/splines.js -I$(emsdk_filepath) -s EXPORT_NAME=createModule -s MODULARIZE=1