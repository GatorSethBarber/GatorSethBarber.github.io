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

const scalarPointMult = (other, pt2) => {
    newPt = [];
    for (let i = 0; i < pt2.length; i++) {
        newPt.push(other * pt2[i]);
    }
    return newPt;
}

const elWiseAddPt = (pt1, pt2) => {
    newPt = [];
    for (let i = 0; i < pt1.length; i++) {
        newPt.push(pt1[i] + pt2[i]);
    }
    return newPt;
}

const deCasteljau = (degree, points, useNum = 10) => {
    // check length
    if ((points.length - 1) % degree != 0) {
        alert("Improper number of control points.");
        return;
    }

    // console.log("useNum:", useNum);

    output = [];
    ts = [];
    // for each group
    let end;
    for (let start = 0; start < points.length; start = start + degree) {
        if (start == points.length - 1) {
            break;
        }
        // console.log("start: ", start);
        tempOne = []
        for (let i = start; i <= start + degree; i++) {
            // console.log("i: ", i);
            // console.log("points[i] = ", points[i]);
            tempOne.push(Array.from(points[i]));
        }

        // Perform de Casteljau for various values of t
        if ((start + degree) === (points.length - 1)) {
            end = useNum + 1;
        } else {
            end = useNum;
        }
        // console.log("end:", end, 0 < end);
        

        for (let ctr = 0; ctr < end; ctr += 1) {
            t = ctr / useNum;
            // console.log("t: ", t);
            tempTwo = []
            tempOne.forEach(element => {
                tempTwo.push(Array.from(element));
            });
            
            while (tempTwo.length > 1) {
                for (let i = 0; i < tempTwo.length - 1; i++) {
                    // (1 - t) * pt1 + t * pt2
                    tempTwo[i] = elWiseAddPt(scalarPointMult(1-t, tempTwo[i]), scalarPointMult(t, tempTwo[i + 1]));
                }
                tempTwo.pop();
            }

            output.push(tempTwo.pop())
        }
    }

    return output;
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

    const spline = deCasteljau(degree, points, numSecs)

    if (spline == undefined) {
        return;
    }

    doGraphing(spline, points);
}

// See: https://www.youtube.com/watch?v=Drt4ICASySo for showLine
const config = {
    type: 'scatter',
    data: {
        datasets: [
            {
                label: 'Bezier Spline',
                data: [],
                backgroundColor: 'lightblue',
                borderColor: 'lightblue',
                showLine: true
            },
            {
                label: 'Control Points',
                data: [],
                backgroundColor: 'blue',
                borderColor: 'black',
                showLine: true,
                lineWidth: 0.5
            }
        ]
    },
    options: {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom'
            }
        },
        // https://stackoverflow.com/questions/38512001/charts-js-graph-not-scaling-to-canvas-size
        maintainAspectRatio: false,
        responsive: true
    },
    
};

let chart = new Chart(document.getElementsByTagName('canvas')[0].getContext('2d'), config);
// console.log(chart.config.data)

const doGraphing = (splineData, cPointsData, convert=true) => {
    if (convert) {
        chart.config.data.datasets[0].data = [];
        chart.config.data.datasets[1].data = [];
        
        chart.update();
        

        splineData.forEach(element => {
            chart.config.data.datasets[0].data.push({x: element[0], y: element[1]});
        });

        cPointsData.forEach(element => {
            chart.config.data.datasets[1].data.push({x: element[0], y: element[1]});
        });
    }

    else {
        chart.config.data.datasets[0].data = splineData;
        chart.config.data.datasets[0].data = cPointsData;
    }

    chart.update();
}