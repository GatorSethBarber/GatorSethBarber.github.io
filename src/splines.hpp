#pragma once
#include <vector>
#include <unordered_map>
#include <string>

using namespace std;

class BSplineMaker {
    vector<double> t;
    vector<vector<double>> spline;
    vector<vector<double>> curves;
public:
    BSplineMaker();
    void setupN_ij(const vector<double>& knots, int i, int j, unordered_map<string, vector<double>>& store);
    void makeBSplineCurves(const vector<double>& knots, int order, int numPoints);
    void makeBSpline(const vector<vector<double>>& cPoints, const vector<double>& knots, int order, int numPoints);

    vector<double> getT();
    vector<vector<double>> getSpline();
    vector<vector<double>> getCurves();
};