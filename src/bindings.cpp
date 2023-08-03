/**
 * Bindings to allow emscripten to compile the code to WebAssembly.
 * Source for binding classes: https://blog.esciencecenter.nl/using-c-in-a-web-app-with-webassembly-efd78c08469
 * Source for binding data types: https://emscripten.org/docs/porting/connecting_cpp_and_javascript/embind.html
 * Figured out vectors previously at: https://github.com/GatorSethBarber/COP3530Project3/blob/main/bindings.cpp
*/
#include <emscripten/bind.h>
#include "splines.hpp"

using namespace emscripten;
EMSCRIPTEN_BINDINGS(Converter) {
    class_<BSplineMaker>("Converter")
        .constructor<>()
        .function("makeBSpline", &BSplineMaker::makeBSpline)
        .function("getT", &BSplineMaker::getT)
        .function("getCurves", &BSplineMaker::getCurves)
        .function("getSpline", &BSplineMaker::getSpline)
        ;
    
    register_vector<double>("vector<double>");
    register_vector<vector<double>>("vector<vector<double>>");
}