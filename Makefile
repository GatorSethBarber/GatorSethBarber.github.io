# Main compilation statement for emcc: https://emscripten.org/docs/porting/connecting_cpp_and_javascript/embind.html
# https://medium.com/netscape/javascript-c-modern-ways-to-use-c-in-javascript-projects-a19003c5a9ff
# https://medium.com/jspoint/a-simple-guide-to-load-c-c-code-into-node-js-javascript-applications-3fcccf54fd32
# https://blog.esciencecenter.nl/using-c-in-a-web-app-with-webassembly-efd78c08469: for main web compilation statement
emsdk_filepath = C:/emcc/emsdk/

test:
	g++ src/main.cpp src/splines.cpp -o test.exe
	test.exe

web:
	$(emsdk_filepath)/emsdk activate latest & emcc -lembind src/splines.cpp src/bindings.cpp -o scripts/splines.js -I$(emsdk_filepath) -s EXPORT_NAME=createModule -s MODULARIZE=1
