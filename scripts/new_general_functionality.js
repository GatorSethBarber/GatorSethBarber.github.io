// For learning more about register_vector (first 2) and potentially more elegant ways to interop with them:
//  https://stackoverflow.com/questions/29327859/pass-pointer-to-stdvector-to-javascript-using-emscripten-and-use-it
//  https://stackoverflow.com/questions/71681491/passing-arrays-and-objects-from-javascript-to-c-in-web-assembly
//  https://stackoverflow.com/questions/29319208/call-c-function-pointer-from-javascript/29319440#29319440

// Trace names for plotly: https://plotly.com/javascript/line-charts/


// Make the object and vector classes available globally after module is loaded
// for convenience.
let bsplinemaker;
let gVecF;
let gVecVecF;

const sanitize_str_input_number = (input, is_float=false) => {
    let good = true;
    if (input.length === undefined || input.length === 0) {
        good = false;
    }
    try {
        for (let i = 0; i < input.length; i++) {
            use_str = is_float ? "1234567890." : "1234567890";
            if (use_str.indexOf(input[i]) == -1) {
                console.log(input[i])
                good = false;
                break;
            }
        }
    } catch {}

    if (!good) {
        alert("Invalid input");
        return false;
    }

    return true;
}

const createGrandPointHolder = (pointNum, defX = 0, defY = 0) => {
    // console.log("pointNum", pointNum, pointNum.toString())
    // create outer div
    let outerDiv = document.createElement('div');
    outerDiv.className = "grand-point-holder";

    // set up point label
    pointLabel = 'p' + pointNum.toString();

    let label = document.createElement('label');
    label.for = pointLabel
    label.textContent = 'Point ' + pointNum.toString();

    let innerDiv = document.createElement('div');
    innerDiv.id = pointLabel;

    // add in actual input elements
    for (let i = 0; i < 2; i++) {
        let input = document.createElement('input');
        input.type = 'number';
        input.className = 'point';
        input.defaultValue = (i == 0) ? defX : defY;
        innerDiv.appendChild(input);
    }

    // Add in delete button
    let delBtn = document.createElement('button');
    delBtn.textContent = "Del"
    delBtn.type = "None"
    delBtn.addEventListener('click', (event, num=pointNum) => removeGrandPointHolder(num));
    innerDiv.appendChild(delBtn);

    // add in the inner_div and label
    outerDiv.appendChild(label)
    outerDiv.appendChild(innerDiv)

    return outerDiv
}

const addGrandPointHolder = (defX = 0, defY = 0) => {
    let cpointsForm = document.getElementById('control-points-form');
    const numChildren = cpointsForm.childElementCount;
    
    newNode = createGrandPointHolder(numChildren, defX, defY);
    cpointsForm.appendChild(newNode);
}

const removeGrandPointHolder = (number) => {
    let cpointsForm = document.getElementById('control-points-form');
    if (number < 0) {
        number = cpointsForm.childElementCount + number;
    }
    if (number < 1) {
        return;
    }
    // console.log("Removing: ", number);
    // console.log("Children: ", cpointsForm.children);
    // console.log("Removing: ", cpointsForm.children[number]);
    cpointsForm.removeChild(cpointsForm.children[number]);

    for (let index = number; index < cpointsForm.childElementCount; index++) {
        node = cpointsForm.children[index]
        if (node.className == "grand-point-holder") {
            node.children[0].textContent = 'Point ' + (index).toString()
            node.children[1].id = 'p' + (index).toString()

            // Based on advice seen somewhere online, delete and recreate button
            node.children[1].children[2].remove()

            let delBtn = document.createElement('button');
            delBtn.textContent = "Del"
            delBtn.type = "None"
            delBtn.addEventListener('click', (event, num=index) => removeGrandPointHolder(num));
            node.children[1].appendChild(delBtn);
        }
    }
}

const splineLayout = {title: "Spline"}
const curvesLayout = {title: "Curves"}

const arrIntoVecF = (arr, vec) => {
    arr.forEach(element => {
       vec.push_back(element); 
    });
}

const arrIntoVecVecF = (arr, vec) => {
    arr.forEach(innerArr => {
        temp = new gVecF();
        innerArr.forEach(element => {
            temp.push_back(element)
        });
        vec.push_back(temp);
    });
}

const stringGVecF = (vec) => {
    let useStr = "";
    for (let i = 0; i < vec.size(); i++) {
        useStr += vec.get(i).toString() + " ";
    }
    return useStr;
}

const stringVecVecF = (vec) => {
    let useStr = "";
    for (let i = 0; i < vec.size(); i++) {
        useStr += stringGVecF(vec.get(i)) + "\n";
    }
    return useStr;
}

const plotSpline = (splineVec, cpointsVec, order) => {
    const splineGraphData = [
        {
            // control points w/line
            x: [],
            y: [],
            mode: "lines",
            type: "scatter",
            name: "Control Polygon"
        },
        {
            // spline w/line
            x: [],
            y: [],
            mode: "lines",
            type: "scatter",
            name: "Spline of Order " + order.toString()
        },
    ];

    // Dump cpoints
    for (let i = 0; i < cpointsVec.get(0).size(); i++) {
        splineGraphData[0].x.push(cpointsVec.get(0).get(i));
        splineGraphData[0].y.push(cpointsVec.get(1).get(i));
    }

    // Dump spline line
    for (let i = 0; i < splineVec.get(0).size(); i++) {
        splineGraphData[1].x.push(splineVec.get(0).get(i));
        splineGraphData[1].y.push(splineVec.get(1).get(i));
    }

    Plotly.newPlot(document.getElementById('spline-canvas'), splineGraphData, splineLayout);

}

const plotCurves = (tVec, curveVec, order) => {
    const curvesData = [];
    let x = [];
    for (let i = 0; i < tVec.size(); i++) {
        x.push(tVec.get(i));
    }

    for (let i = 0; i < curveVec.size(); i++) {
        newObj = {x: x, y: [], mode: "lines"}
        for (let j = 0; j < curveVec.get(i).size(); j++) {
            newObj.y.push(curveVec.get(i).get(j))
        }
        curvesData.push(newObj);
    }

    Plotly.newPlot(document.getElementById('curve-canvas'), curvesData, curvesLayout);
}

const getNumPoints = () => {
    const rawNumPoints = document.getElementById('num-points').value.toString();
    if (rawNumPoints.length == 0) {
        alert("Please enter a valid number for the number of points.");
        return;
    }
    return Number(rawNumPoints);
}

const getOrder = () => {
    const rawOrder = document.getElementById('degree').value.toString();
    if (rawOrder.length == 0) {
        alert("Please enter a valid number for degree.");
        return;
    }
    return Number(rawOrder);
}

const getKnotType = () => {
    const knotBtns = document.getElementsByClassName("r-btn");
    for (let i = 0; i < knotBtns.length; i++) {
        if (knotBtns[i].checked) {
            return knotBtns[i].value;
        }
    }
    return "";
}

const getCPointsVecVecF = () => {
    // Get cpoints
    const rawPoints = document.getElementsByClassName('point')
    const cpoints = new gVecVecF();
    const xVec = new gVecF();
    const yVec = new gVecF();
    for (let i = 0; i < rawPoints.length; i++) {
        if (rawPoints[i].toString().length == 0) {
            alert("Invalid or missing value for control point.");
            return;
        }
        if (i % 2 == 0) {
            xVec.push_back(Number(rawPoints[i].value))
        } else {
            yVec.push_back(Number(rawPoints[i].value));
        }
    }
    cpoints.push_back(xVec);
    cpoints.push_back(yVec);

    return cpoints;
}


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
    const knots = new gVecF();
    const knotType = getKnotType();
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

    try {
        bsplinemaker.makeBSpline(cpointsVec, knots, order, numPoints);
    } catch (error) {
        alert("Error encountered.");
        console.log(error);
        return;
    }

    const tVec = bsplinemaker.getT();
    const splineVec = bsplinemaker.getSpline();
    const curvesVec = bsplinemaker.getCurves();

    plotSpline(cpointsVec, splineVec, order);
    plotCurves(tVec, curvesVec);

}

// Based on https://github.com/GatorSethBarber/COP3530Project3/blob/a9aa02985a29c6f5fde027e427496f2067e0bcf1/webpages/questionnaire.html
createModule().then(({BSplineMaker, VecF, VecVecF}) => {
    bsplinemaker = new BSplineMaker();
    gVecF = VecF;
    gVecVecF = VecVecF;

    // alert("Ready for use.")

    document.getElementById('graph-btn').addEventListener('click', () => {
        calcAndGraphBSpline();
    });  
}).catch(console.log)