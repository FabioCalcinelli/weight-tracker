package com.example.weighttracker

import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.example.weighttracker.ui.theme.WeightTrackerTheme
import com.patrykandpatrick.vico.compose.axis.horizontal.rememberBottomAxis
import com.patrykandpatrick.vico.compose.axis.vertical.rememberStartAxis
import com.patrykandpatrick.vico.compose.chart.Chart
import com.patrykandpatrick.vico.compose.chart.line.lineChart
import com.patrykandpatrick.vico.compose.component.shapeComponent
import com.patrykandpatrick.vico.core.chart.line.LineChart
import com.patrykandpatrick.vico.core.component.shape.Shapes
import com.patrykandpatrick.vico.core.entry.entryModelOf
import com.patrykandpatrick.vico.core.entry.FloatEntry
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

class MainActivity : ComponentActivity() {
    private val weightRepository = WeightRepository()

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val viewModel: WeightViewModel by viewModels()

        setContent {
            WeightTrackerTheme {
                val weights by viewModel.weights.collectAsState()

                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        weightPlot(weights)
                        AddButton {
                            val newWeight = WeightData(LocalDate.of(2025, 3, 29), 96.0)
                            viewModel.addWeight(newWeight)
                        }
                    }
                }
            }
        }
    }
}
@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun weightPlot(weightDataList: List<WeightData>) {
    // Sort data by date
    val sortedData = remember(weightDataList) {
        weightDataList.sortedBy { it.date }
    }

    // Find the earliest date to use as reference point
    val earliestDate = remember(sortedData) {
        sortedData.minByOrNull { it.date }?.date ?: LocalDate.now()
    }

    // Convert to chart entries (x-axis is days since earliest date)
    val entries = remember(sortedData) {
        sortedData.map { weightData ->
            val daysSinceStart = ChronoUnit.DAYS.between(earliestDate, weightData.date).toFloat()
            FloatEntry(daysSinceStart, weightData.weight.toFloat())
        }
    }

    val chartEntryModel = remember(entries) { entryModelOf(entries) }

    // Create a custom line chart
    val lineChart = lineChart(
        lines = listOf(
            LineChart.LineSpec(
                pointSizeDp = 8f,
                point = shapeComponent(
                    shape = Shapes.roundedCornerShape(),
                    color = MaterialTheme.colorScheme.primary
                ),
            )
        )
    )




    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = "Weight History",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(bottom = 8.dp)
        )

        Chart(
            chart = lineChart,
            model = chartEntryModel,
            startAxis = rememberStartAxis(
                title = "Weight (kg)",
                valueFormatter = { value, _ -> "%.1f".format(value) }
            ),
            bottomAxis = rememberBottomAxis(
                title = "Days",
                valueFormatter = { value, _ ->
                    val date = earliestDate.plusDays(value.toLong())
                    date.format(DateTimeFormatter.ofPattern("MM/dd"))
                }
            ),
            modifier = Modifier
                .fillMaxWidth()
                .height(250.dp)
        )
    }
}

@Composable
fun AddButton(onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier.padding(16.dp)
    ) {
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
