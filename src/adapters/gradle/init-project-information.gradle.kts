import groovy.json.JsonOutput
import groovy.json.JsonGenerator

/**
 * Computes the qualified property name for a project's version in gradle.properties.
 * Returns "version" for root, "{name}.version" for subprojects.
 */
fun Project.qualifiedVersionProperty(): String {
    val name = name.split(':').last()
    return if (name.isEmpty()) "version" else "${name}.version"
}

gradle.rootProject {
    /**
     * Collects and outputs project structure information as JSON.
     * Includes module hierarchy, paths, versions, and affected modules.
     */
    tasks.register("printProjectInformation") {
        group = "help"
        description = "Shows which subprojects are affected when a parent project changes."

        // Capture hierarchy data at configuration time
        val hierarchyDepsProvider = provider {
            val hierarchyEdges = linkedMapOf<String, Set<String>>()

            gradle.rootProject.allprojects.forEach { project ->
                val affectedChildren = mutableSetOf<String>()

                // Recursively collect all subprojects
                fun collectSubprojects(parent: org.gradle.api.Project) {
                    parent.subprojects.forEach { child ->
                        affectedChildren.add(child.path)
                        collectSubprojects(child)
                    }
                }

                collectSubprojects(project)
                hierarchyEdges[project.path] = affectedChildren.toSet()
            }
            hierarchyEdges
        }

        // Capture project metadata at configuration time
        val projectDataProvider = provider {
            val projectData = linkedMapOf<String, Map<String, Any?>>()

            gradle.rootProject.allprojects.forEach { project ->
                // Calculate relative path from root
                val relativePath = gradle.rootProject.projectDir.toPath().relativize(project.projectDir.toPath()).toString()
                val path = if (relativePath.isEmpty()) "." else relativePath
                
                // Get version, treating "unspecified" as null
                val version = if (project.version == "unspecified") null else project.version
                
                // Determine project type
                val type = if (project == gradle.rootProject) "root" else "module"

                // Check if version is declared in gradle.properties
                val versionPropertyKey = project.qualifiedVersionProperty()
                val versionFromProperty = project.findProperty(versionPropertyKey) as? String

                projectData[project.path] = mapOf(
                    "path" to path,
                    "version" to version,
                    "type" to type,
                    "name" to project.name,
                    "declaredVersion" to (versionFromProperty != null)
                )
            }
            projectData
        }

        doLast {
            val hierarchyMap = hierarchyDepsProvider.get()
            val projectDataMap = projectDataProvider.get()

            // Merge hierarchy and project data
            val result = hierarchyMap.toSortedMap().mapValues { (projectPath, affectedModules) ->
                val projectInfo = projectDataMap.getValue(projectPath)

                mapOf(
                    "path" to projectInfo["path"],
                    "affectedModules" to affectedModules.toSortedSet(),
                    "version" to projectInfo["version"],
                    "type" to projectInfo["type"],
                    "name" to projectInfo["name"],
                    "declaredVersion" to projectInfo["declaredVersion"]
                )
            }

            // Configure JSON output to exclude null values
            val generator = JsonGenerator.Options()
                .excludeNulls()
                .build()

            // Print JSON output to stdout
            println(JsonOutput.prettyPrint(generator.toJson(result)))
        }
    }

    /**
     * Convenience alias for printProjectInformation task.
     * Usage: ./gradlew --init-script <path> structure
     */
    tasks.register("structure") {
        group = "help"
        description = "Show project structure information"
        dependsOn("printProjectInformation")
    }
}
