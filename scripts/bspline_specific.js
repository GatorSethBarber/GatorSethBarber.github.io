const calcAndGraphBSpline = () => {
    const numPoints = getNumPoints();
    if (numPoints === undefined) return;
    const order = getOrder();
    if (order === undefined) return;
    const cpointsVec = getCPointsVecVecF();
    if (cpointsVec === undefined) return;

    // Get knots
    // Currently, will just make it a uniform B-spline
    const numKnots = cpointsVec.get(0).size() + order + 1;
    // console.log("numKnots: ", numKnots)
    // console.log("order: ", order)
    // console.log("numCpoints: ", cpointsVec.get(0).size())
    
    let knots = new gVecF();
    const knotType = getKnotType();
    if (knotType === "custom") {
        knots = getCustomKnotVec();
        if (knots === undefined) return;
        if (knots.size() !== numKnots) {
            alert("Expecting " + numKnots.toString() + " knots, not " + knots.size().toString() + ".");
            return;
        }
    }

    else {
        for (let i = 0; i < numKnots; i++) {
            if (knotType === "natural") {
                knots.push_back(i);
            } else {
                if (i < numKnots / 2)
                    knots.push_back(0);
                else
                    knots.push_back(1);
            }
        }
    }

    try {
        splinemaker.makeBSpline(cpointsVec, knots, order, numPoints);
    } catch (error) {
        alert("Error encountered.");
        console.log(error);
        return;
    }

    const tVec = splinemaker.getT();
    const splineVec = splinemaker.getSpline();
    const curvesVec = splinemaker.getCurves();

    const subtitle = "<em style=\"font-size:0.75rem\">Order: " + order.toString() + ", t: [" + stringGVecF(knots) + "]</em>";

    plotSpline(cpointsVec, splineVec, subtitle);
    plotCurves(tVec, curvesVec, subtitle);

}

// Based on https://github.com/GatorSethBarber/COP3530Project3/blob/a9aa02985a29c6f5fde027e427496f2067e0bcf1/webpages/questionnaire.html
createModule().then(({BSplineMaker, VecF, VecVecF}) => {
    // This is defined elsewhere
    splinemaker = new BSplineMaker();
    gVecF = VecF;
    gVecVecF = VecVecF;

    // alert("Ready for use.")

    document.getElementById('graph-btn').addEventListener('click', () => {
        calcAndGraphBSpline();
    });  
}).catch(error => {alert("Error in loading converter."); console.log(error)})