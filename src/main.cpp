#include <vector>
#include <iostream>
#include <cmath>
#include <algorithm>
#include "splines.hpp"

using namespace std;

int main() {
    vector<vector<double>> cpoints{{0, 1, 2, 3}, {0, 1, 1, 0}};
    vector<double> knots{0, 1, 2, 3, 4, 5, 6, 7};
    cout << "Max of knots: " << *max_element(knots.begin(), knots.end()) << endl;
    cout << "Min of knots: " << *min_element(knots.begin(), knots.end()) << endl;
     int order = 3;

    BSplineMaker maker;
    maker.makeBSpline(cpoints, knots, order, 10);

    cout << "Output t: ";
    for (const double& el : maker.getT()) cout << el << " ";
    cout << endl << endl;

    cout << "Output spline:" << endl;
    for (const vector<double>& dimArr : maker.getSpline()) {
        for (const double& el : dimArr) cout << el << " ";
        cout << endl;
    }
    cout << endl;

    cout << "Output curves:" << endl;
    for (const vector<double>& cvArr : maker.getCurves()) {
        for (const double& el : cvArr) cout << el << " ";
        cout << endl;
    }
    cout << endl;

    cout << abs(-0.11) << endl;

    return 0;
}