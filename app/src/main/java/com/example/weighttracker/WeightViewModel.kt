package com.example.weighttracker

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class WeightViewModel : ViewModel() {
    private val weightRepository = WeightRepository()

    private val _weights = MutableStateFlow<List<WeightData>>(emptyList())
    val weights: StateFlow<List<WeightData>> = _weights

    init {
        loadWeights()
    }

    private fun loadWeights() {
        _weights.value = weightRepository.getWeightDataList()
    }

    fun addWeight(weight: WeightData) {
        weightRepository.addWeightData(weight)
        loadWeights() // Refresh the data
    }
}
