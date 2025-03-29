package com.example.weighttracker

import android.graphics.Point
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.example.weighttracker.ui.theme.WeightTrackerTheme
import ir.ehsannarmani.compose_charts.LineChart
import ir.ehsannarmani.compose_charts.LineChartData
import ir.ehsannarmani.compose_charts.models.Line

class MainActivity : ComponentActivity() {
    private val weightRepository = WeightRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            WeightTrackerTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        weightPlot(
                            weightRepository.getWeightDataList()
                        )
                        AddButton{
                            val weightData = WeightData("2025-03-29", 96.0)
                            weightRepository.addWeightData(weightData)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun weightPlot(weightDataList: List<WeightData>) {
    // Convert weight data to a list of Points
    val points = weightDataList.mapIndexed { index, weightData ->
        Point(x = index.toFloat(), y = weightData.weight.toFloat())
    }

    // Create a Line object with the points
    val line = Line(points = points)

    // Use the LineChart composable with the line data
    LineChart(
        modifier = Modifier.fillMaxSize(),
        lines = listOf(line)
    )
}

@Composable
fun AddButton(onClick: () -> Unit) {
    Button(onClick = onClick) {
        Text("Add new weight")
    }
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    WeightTrackerTheme {
        Text(
            text = "Track your weight"
        )
    }
}