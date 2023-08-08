// For learning more about register_vector (first 2) and potentially more elegant ways to interop with them:
//  https://stackoverflow.com/questions/29327859/pass-pointer-to-stdvector-to-javascript-using-emscripten-and-use-it
//  https://stackoverflow.com/questions/71681491/passing-arrays-and-objects-from-javascript-to-c-in-web-assembly
//  https://stackoverflow.com/questions/29319208/call-c-function-pointer-from-javascript/29319440#29319440

// Plotly originally based off of: https://www.w3schools.com/js/js_graphics_plotly.asp
// Trace names for plotly: https://plotly.com/javascript/line-charts/
// For layout for plotly: https://plotly.com/javascript/layout-template/
// More annotation: https://plotly.com/javascript/text-and-annotations/
// About subtitle: https://github.com/plotly/plotly.js/issues/233, particularly the post by peteristhegreat.
// For handling NaN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN
//   (see also: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/NaN)


// Make the object and vector classes available globally after module is loaded
// for convenience.
let splinemaker;
let gVecF;
let gVecVecF;

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
        input.className = 'point-input';
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
    for (let i = 0; i < vec.size() - 1; i++) {
        useStr += vec.get(i).toString() + ", ";
    }
    if (vec.size() > 0)
        useStr += vec.get(vec.size() - 1).toString();
    return useStr;
}

const stringVecVecF = (vec) => {
    let useStr = "";
    for (let i = 0; i < vec.size(); i++) {
        useStr += stringGVecF(vec.get(i)) + "\n";
    }
    return useStr;
}

const plotSpline = (cpointsVec, splineVec, subtitle) => {
    const splineGraphData = [
        {
            // control points w/line
            x: [],
            y: [],
            mode: "markers+lines",
            type: "scatter",
            name: "Control Polygon"
        },
        {
            // spline w/line
            x: [],
            y: [],
            mode: "lines",
            type: "scatter",
            name: "Spline"
        },
    ];

    const splineLayout = {title: "Spline<br>" + subtitle}

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

const plotCurves = (tVec, curveVec, subtitle) => {
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

    
    const curvesLayout = {
        title: "Curves<br>" + subtitle, 
    };

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

const getCustomKnotVec = () => {
    const rawSplitData = document.getElementById("custom-knot-input").value.split(",");
    let knotVec = new gVecF();

    let temp;
    for (let i = 0; i < rawSplitData.length; i++) {
        try {
            temp = Number(rawSplitData[i]);
            if (Number.isNaN(temp) || rawSplitData[i].trim() === "") {
                throw Error();
            }
        } catch (error) {
            alert("Knot '" + rawSplitData[i] + "' cannot be interpreted as a number.")
            return;
        }
        // console.log(temp, typeof(temp));
        knotVec.push_back(temp);
    }

    return knotVec;
}

const getCPointsVecVecF = () => {
    // Get cpoints
    const rawPoints = document.getElementsByClassName('point-input')
    // console.log(rawPoints);
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
