package com.example.weighttracker

class WeightRepository {
    private val weightDataList = mutableListOf<WeightData>()

    fun addWeightData(weightData: WeightData) {
        weightDataList.add(weightData)
    }

    fun getWeightDataList() = weightDataList.toList()
}