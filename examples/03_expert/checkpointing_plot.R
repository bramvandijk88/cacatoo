library(rjson)  # Load the package required to the grid dumped in a JSON file.
library(purrr)  # For extracting variables from nested list (such as the Cacatoo grid dump)
library(ggplot2)# Using ggplot to plot the grid
library(dplyr)  # Using dplyr for data filtering / transformation


cacatoo_grid <- fromJSON(file = "cheater_000001.json")                   # Loads the Cacatoo grid as a nested lists of variables
species_only <- modify_depth(cacatoo_grid,2,"species")                   # Extract only the 'species' variable 
species_grid <- do.call(cbind,species_only)         # Convert to nxn matrix instead of nested list

species_long <- data.frame(r=as.vector(row(species_grid)),
           c=as.vector(col(species_grid)),
           val=as.vector(unlist(species_grid)),
           var="species")

# Draw a grid
species_long %>% ggplot(aes(x=r,y=-c,fill=as.factor(val))) + 
  geom_raster() +
  scale_fill_manual(values=c("black","white","red","blue"), name="species") +
  coord_fixed() +
  theme_void() +
  theme(panel.background = element_rect(fill = 'black', colour = 'black'))

# Or points. Can be useful if you want to see differences in density better. 
species_long %>% filter(val>0) %>% ggplot(aes(x=r,y=-c,col=as.factor(val))) + 
  geom_point(size=1.7) + 
  scale_color_manual(values=c("white","red","blue"), name="species") +
  coord_fixed() +
  theme_void() +
  theme(panel.background = element_rect(fill = 'black', colour = 'black'))
