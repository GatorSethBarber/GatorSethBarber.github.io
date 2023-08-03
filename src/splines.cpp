#include "splines.hpp"
#include <cmath>

// For proper library to use abs: https://en.cppreference.com/w/cpp/numeric/math/abs

// DANGER: This file uses unchecked accesses for speed. Does not matter if running client-side. If running server side, may want to change.

// Note: Adding in constructor
BSplineMaker::BSplineMaker() {};

void BSplineMaker::setupN_ij(const vector<double>& knots, int i, int j, unordered_map<string, vector<double>>& store) {
    if (store.find(to_string(i) + "_" + to_string(j)) != store.end())
        return;

    auto newN = t;
    const double delta = 0.0001;

    if (j == 0) {
        for (double& el : newN) {
            if (el >= knots[i] && el < knots[i+1]|| (el - knots[knots.size() - 1]) < delta)
                el = 1;
            else
                el = 0;
        }
    }
    else {
        setupN_ij(knots, i, j - 1, store);      // Prepare firstN
        setupN_ij(knots, i + 1, j - 1, store);  // prepare secondN
        const vector<double>& firstN = store.at(to_string(i) + "_" + to_string(j - 1));
        const vector<double>& secondN = store.at(to_string(i + 1) + "_" + to_string(j - 1));

        for (int ctr = 0; ctr < newN.size(); ctr++) {
            double& el = newN[ctr];
            double firstOmega = (abs(knots[i+j] - knots[i]) > delta) ? (el - knots[i]) / (knots[i + j] - knots[i]) : 0;
            double secondCoef = (abs(knots[i+ j + 1] - knots[i+1]) > delta) ? (knots[i + j + 1] - el) / (knots[i + j + 1] - knots[i+1]) : 0;
            el = firstOmega * firstN[ctr] + secondCoef * secondN[ctr];
        }
    }

    store[to_string(i) + "_" + to_string(j)] = newN;
}

void BSplineMaker::makeBSplineCurves(const vector<double>& knots, int order, int numPoints) {
    t = vector<double>(numPoints);

    // Eventually, these can be replaced by getting max and min over certain region
    double max = knots[knots.size() - order - 1];
    double min = knots[order];
    double multiplier = (max - min) / (numPoints - 1);

    for (int i = 0; i < numPoints; i++) {
        t[i] = min + multiplier * i;
        // cout << "At " << i << " get " << t[i] << endl;
    }

    unordered_map<string, vector<double>> store;

    // Now, to calculate the curves.
    
    int numCurves = knots.size() - order - 1;
    curves = vector<vector<double>>(numCurves, vector<double>(numPoints));    // May want to figure out pre-allocation
    
    for (int i = 0; i < numCurves; i++) {
        setupN_ij(knots, i, order, store);
        curves[i] = store.at(to_string(i) + "_" + to_string(order));
    }
}

void BSplineMaker::makeBSpline(const vector<vector<double>>& cPoints, const vector<double>& knots, int order, int numPoints) {
    if (cPoints.size() < 1) {
        return;
    }
    // Number of curves should equal number of control points
    int numCurves = knots.size() - order - 1;
    int numCPoints = cPoints[0].size();

    makeBSplineCurves(knots, order, numPoints);

    // Num curves will be the number of control points
    spline = vector<vector<double>>(cPoints.size(), vector<double>(numPoints));

    
    for (int dim = 0; dim < cPoints.size(); dim++) {
        for (int i = 0; i < numPoints; i++) {
            spline[dim][i] = 0;
            for (int cv_ind = 0; cv_ind < curves.size(); cv_ind++) {
                spline[dim][i] += cPoints[dim][cv_ind] * curves[cv_ind][i];
            }
        }
    }    
}

vector<double> BSplineMaker::getT() {
    return t;
}

vector<vector<double>> BSplineMaker::getSpline() {
    return spline;
}

vector<vector<double>> BSplineMaker::getCurves() {
    return curves;
}