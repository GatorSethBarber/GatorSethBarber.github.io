let bsplinemaker;

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

const createGrandPointHolder = (pointNum) => {
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
        input.defaultValue = 0;
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

const addGrandPointHolder = () => {
    let cpointsForm = document.getElementById('control-points-form');
    const numChildren = cpointsForm.childElementCount;
    // console.log(numChildren);
    newNode = createGrandPointHolder(numChildren);
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

const getPoints = () => {
    let nodes = document.getElementsByClassName('point');
    let values = [];
    for (let i = 0; i < nodes.length; i += 2) {

        // Better input sanitization
        try {
            values.push([Number(nodes[i].value), Number(nodes[i + 1].value)]);
        }
        catch {
            alert("invalid input");
            return [];
        }
    }

    return values;
}

const bezierSpline = () => {
    const degreeRaw = document.getElementById('degree').value;
    const numSecsRaw = document.getElementById('num-sections').value;

    // console.log("Num Sections: ", numSecsRaw)
    // Input Sanitization!!!!
    console.log("line 195")

    if (!sanitize_str_input_number(degreeRaw) || !sanitize_str_input_number(numSecsRaw)) {
        console.log("197", degreeRaw);
        console.log("198", numSecsRaw);
        return;
    }

    const degree = Number(degreeRaw);
    const numSecs = Number(numSecsRaw);
    let points = getPoints();

    // console.log("degree: ", degree);
    // console.log("points: ", points);

    // const spline = deCasteljau(degree, points, numSecs)

    // if (spline == undefined) {
    //     return;
    // }

    // doGraphing(spline, points);
}

const splineData = [
    {
        // control points w/line
        x: [],
        y: yArray,
        mode: "lines",
        type: "scatter"
    },
    {
        // spline w/line
        x: [],
        y: [],
        type: "lines",
        orientation: "v"
    },
];

const cuvesData = [
    // will be like
    /*
    {
        x: [],
        y: [],
        mode: "lines"
    }
    // for each curve
    */
]

const splineLayout = {title: "Spline"}
const curvesLayout = {title: "Curves"}


// Plotly.newPlot()

// Based on https://github.com/GatorSethBarber/COP3530Project3/blob/a9aa02985a29c6f5fde027e427496f2067e0bcf1/webpages/questionnaire.html
createModule().then(({BSplineMaker}) => {
    console.log("Loaded!")
    const knots = [0, 0, 0, 0, 1, 1, 1, 1]
    const cpoints = [[0, 1, 2, 3], [0, 1, 1, 0]]
    const order = 3;
    const numPoints = 10;

    bsplinemaker.makeBSpline(cpoints, knots, order, numPoints);
    console.log("t",  bsplinemaker.getT());
    console.log("spline", bsplinemaker.getSpline());
    console.log("curves", bsplinemaker.getCurves());
    
    // hoist converter
    bsplinemaker = new BSplineMaker();
    const cvtBtn = document.getElementById('convert-button');
    cvtBtn.addEventListener('click', () => {
        return;
    })
}).catch(console.log)