const roundToNDigits = (value: number, digits = 2) => {
  return Math.round((value + Number.EPSILON) * 10 ** digits) / 10 ** digits;
};

type variantInterface = {
  matrix_1: number[][];
  matrix_2: number[][];
  matrix_3: number[][];
  matrix_4: number[][];
  matrix_5: number[][];
};

const variant: variantInterface = {
  matrix_1: [
    [1, 4, 0.25, 0.5],
    [0.25, 1, 0.25, 0.2],
    [4, 4, 1, 2],
    [2, 5, 0.5, 1],
  ],
  matrix_2: [
    [1, 2, 1],
    [0.5, 1, 0.5],
    [1, 2, 1],
  ],
  matrix_3: [
    [1, 3, 5],
    [0.3333333333333333, 1, 3],
    [0.2, 0.3333333333333333, 1],
  ],
  matrix_4: [
    [1, 4, 0.3333333333333333],
    [0.25, 1, 0.16666666666666666],
    [3, 6, 1],
  ],
  matrix_5: [
    [1, 0.3333333333333333, 1],
    [3, 1, 3],
    [1, 0.3333333333333333, 1],
  ],
};

const mathExpectationsOfConsistencyIndex: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

const calculatePriorityElement = (arr: number[]) =>
  roundToNDigits(
    Math.pow(
      arr.reduce((acc, value) => acc * value, 1),
      1 / arr.length
    )
  );

const calculatePriorityVector = (matrix: number[][]) =>
  matrix.map((arr) => calculatePriorityElement(arr));

const calculateWeightElement = (vectorElement: number, vectorSum: number) =>
  roundToNDigits(vectorElement / vectorSum);

const calculateWeightVector = (vector: number[], priorityVectorSum: number) =>
  vector.map((element) => calculateWeightElement(element, priorityVectorSum));

const calculateMatrixWeightElement = (
  matrixRow: number[],
  weightVector: number[]
) =>
  roundToNDigits(
    matrixRow.reduce(
      (acc, value, index) => roundToNDigits(acc + value * weightVector[index]!),
      0
    )
  );

const calculateMatrixWeightVector = (
  matrix: number[][],
  weightVector: number[]
) =>
  matrix.map((matrixRow) =>
    calculateMatrixWeightElement(matrixRow, weightVector)
  );

const calculateLambdaVector = (
  weightVector: number[],
  matrixWeightVector: number[]
) =>
  matrixWeightVector.map((value, index) =>
    roundToNDigits(value / weightVector[index]!)
  );

const calculateEigenvalue = (lambdaVector: number[]) =>
  roundToNDigits(
    lambdaVector.reduce((acc, value) => acc + value, 0) / lambdaVector.length
  );

const calculateConsistencyIndex = (
  eigenvalue: number,
  lambdaVector: number[]
) =>
  roundToNDigits(
    (eigenvalue - lambdaVector.length) / (lambdaVector.length - 1)
  );

const calculateConsistencyRatio = (
  matrix: number[][],
  consistencyIndex: number
) =>
  roundToNDigits(
    consistencyIndex / mathExpectationsOfConsistencyIndex[matrix.length]!
  );

const isConsistencyAcceptable = (consistencyRatio: number) =>
  Math.abs(consistencyRatio) < 0.1;

const calculateWeightsRatioMatrix = (weightVector: number[]) => {
  const matrix: number[][] = [];
  weightVector.forEach((weight) => {
    matrix.push(weightVector.map((value) => roundToNDigits(weight / value)));
  });

  return matrix;
};

const calculateCorrectedWeightRatioMatrix = (
  matrix: number[][],
  weightsRatioMatrix: number[][]
) => {
  const newMatrix = matrix.map((arr, index) =>
    arr.map((value, index2) =>
      Math.abs(roundToNDigits(value - weightsRatioMatrix[index]![index2]!))
    )
  );
  return newMatrix;
};

const findMaxSumIndex = (weightRatioMatrix: number[][]) => {
  const sums = weightRatioMatrix.map((arr) =>
    arr.reduce((acc, value) => acc + value, 0)
  );
  return sums.indexOf(Math.max(...sums));
};

const calculateNewCorrectedMatrix = (
  matrix: number[][],
  weightRatioMatrix: number[][],
  indexToChange: number
) =>
  matrix.map((arr, index) => {
    if (index === indexToChange) return weightRatioMatrix[index]!;
    return arr.map((value, index2) =>
      index2 === indexToChange
        ? roundToNDigits(1 / weightRatioMatrix[indexToChange]![index]!)
        : value
    );
  });

type ReturnTypeSolveMatrix = {
  priorityVector: number[];
  priorityVectorSum: number;
  weightVector: number[];
  matrixWeightVector: number[];
  lambdaVector: number[];
  eigenvalue: number;
  consistencyIndex: number;
  consistencyRatio: number;
};

const solveMatrix = (matrix: number[][]): ReturnTypeSolveMatrix => {
  const priorityVector = calculatePriorityVector(matrix);
  const priorityVectorSum = priorityVector.reduce(
    (acc, value) => acc + value,
    0
  );
  const weightVector = calculateWeightVector(priorityVector, priorityVectorSum);
  const matrixWeightVector = calculateMatrixWeightVector(matrix, weightVector);
  const lambdaVector = calculateLambdaVector(weightVector, matrixWeightVector);
  const eigenvalue = calculateEigenvalue(lambdaVector);
  const consistencyIndex = calculateConsistencyIndex(eigenvalue, lambdaVector);
  const consistencyRatio = calculateConsistencyRatio(matrix, consistencyIndex);

  if (!isConsistencyAcceptable(consistencyRatio)) {
    const weightsRatioMatrix = calculateWeightsRatioMatrix(weightVector);
    const weightsCorrectedRatioMatrix = calculateCorrectedWeightRatioMatrix(
      matrix,
      weightsRatioMatrix
    );
    const maxSumIndex = findMaxSumIndex(weightsCorrectedRatioMatrix);

    const newVariant = calculateNewCorrectedMatrix(
      matrix,
      weightsRatioMatrix,
      maxSumIndex
    );
    return solveMatrix(newVariant);
  }

  return {
    priorityVector,
    priorityVectorSum,
    weightVector,
    matrixWeightVector,
    lambdaVector,
    eigenvalue,
    consistencyIndex,
    consistencyRatio,
  };
};

const createFinalMatrix = (...weights: number[][]) => {
  const finalMatrix: number[][] = [];
  if (weights[0] && weights[0]?.length) {
    for (let i = 0; i < weights[0]?.length; i++) {
      finalMatrix[i] = [];
      for (let j = 0; j < weights.length; j++) {
        finalMatrix[i]!.push(weights[j]![i]!);
      }
    }
  }

  return finalMatrix;
};
function multiplyMatrices(matrix1: number[][], matrix2: number[][]) {
  if (matrix1[0]?.length !== matrix2.length) {
    console.log(
      'Умножение невозможно. Количество столбцов первой матрицы не равно количеству строк второй матрицы.'
    );
    return;
  }

  const result = [];
  for (let i = 0; i < matrix1.length; i++) {
    let sum = 0;
    if (matrix1[i] && matrix1[i]!.length && matrix2[i]?.length) {
      for (let k = 0; k < matrix1[i]!.length; k++) {
        sum += roundToNDigits(matrix1[i]![k]! * matrix2[k]![0]!);
      }
    }
    result.push([roundToNDigits(sum)]);
  }
  return result;
}

const createResultPriorities = (multipliedMatrices: number[][]) => {
  const res: number[] = [];

  multipliedMatrices?.forEach((arr) => {
    res.push(...arr);
  });

  return res;
};

const findBestAlternative = (priorities: number[]) =>
  priorities.findIndex((pr) => pr === Math.max(...priorities));

export const solveVariant = (variant: variantInterface) => {
  const { matrix_1, matrix_2, matrix_3, matrix_4, matrix_5 } = variant;
  const firstWeights = solveMatrix(matrix_1).weightVector;
  const secondWeights = solveMatrix(matrix_2).weightVector;
  const thirdWeights = solveMatrix(matrix_3).weightVector;
  const fourthWeights = solveMatrix(matrix_4).weightVector;
  const fifthWeights = solveMatrix(matrix_5).weightVector;

  const finalMatrix = createFinalMatrix(
    secondWeights,
    thirdWeights,
    fourthWeights,
    fifthWeights
  );
  const finalWeights = createFinalMatrix(firstWeights);

  const multipliedMatrices = multiplyMatrices(finalMatrix, finalWeights);

  const resultPriorities = createResultPriorities(multipliedMatrices!);

  const bestAlternative = findBestAlternative(resultPriorities);

  console.log('bestAlternative', bestAlternative);
};

solveVariant(variant);
